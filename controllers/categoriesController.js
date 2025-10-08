import pool, { query, execute } from '../config/mysql.js';
import validator from 'validator';

// Helper function to generate slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Helper function to validate category data
const validateCategoryData = (data, isUpdate = false) => {
  const errors = {};

  if (!isUpdate || data.name !== undefined) {
    if (!data.name || data.name.trim().length === 0) {
      errors.name = 'Category name is required';
    } else if (data.name.length > 50) {
      errors.name = 'Category name must be less than 50 characters';
    }
  }

  if (!isUpdate || data.description !== undefined) {
    if (data.description && data.description.length > 65535) {
      errors.description = 'Description is too long';
    }
  }

  if (!isUpdate || data.image_url !== undefined) {
    if (data.image_url && data.image_url.length > 500) {
      errors.image_url = 'Image URL must be less than 500 characters';
    }
    if (data.image_url && !validator.isURL(data.image_url)) {
      errors.image_url = 'Invalid image URL format';
    }
  }

  if (!isUpdate || data.parent_id !== undefined) {
    if (data.parent_id && !Number.isInteger(Number(data.parent_id))) {
      errors.parent_id = 'Invalid parent category ID format';
    }
  }

  if (!isUpdate || data.sort_order !== undefined) {
    if (data.sort_order !== undefined && !Number.isInteger(Number(data.sort_order))) {
      errors.sort_order = 'Sort order must be an integer';
    }
  }

  if (!isUpdate || data.is_active !== undefined) {
    if (data.is_active !== undefined && typeof data.is_active !== 'boolean') {
      errors.is_active = 'is_active must be a boolean value';
    }
  }

  return errors;
};

// Create a new category
export const createCategory = async (req, res) => {
  try {
    const { name, description, parent_id, image_url, sort_order, is_active } = req.body;

    // Validate input data
    const validationErrors = validateCategoryData(req.body);
    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    // Generate slug from name
    const slug = generateSlug(name);

    // Check if slug already exists
    const existingSlug = await query(
      'SELECT id FROM categories WHERE slug = ?',
      [slug]
    );

    if (existingSlug.length > 0) {
      return res.status(400).json({ error: 'Category with this name already exists' });
    }

    // Validate parent category if provided
    if (parent_id) {
      const parentCategory = await query(
        'SELECT id FROM categories WHERE id = ?',
        [parent_id]
      );

      if (parentCategory.length === 0) {
        return res.status(400).json({ error: 'Parent category not found' });
      }
    }

    // Insert new category
    const result = await execute(
      `INSERT INTO categories 
       (name, slug, description, parent_id, image_url, sort_order, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        validator.escape(name.trim()),
        slug,
        description ? validator.escape(description.trim()) : null,
        parent_id || null,
        image_url || null,
        sort_order || 0,
        is_active !== undefined ? is_active : true
      ]
    );

    // Get the newly created category
    const [newCategory] = await query(
      `SELECT id, name, slug, description, parent_id, image_url, sort_order, is_active, 
              created_at, updated_at 
       FROM categories WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Category created successfully!',
      data: { category: newCategory }
    });
  } catch (err) {
    console.error('Create category error:', err);
    
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Category name or slug already exists' });
    }
    
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Get all categories with optional filtering and pagination
export const getCategories = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      is_active, 
      parent_id,
      include_children = false 
    } = req.query;

    const offset = (page - 1) * limit;
    const whereConditions = [];
    const queryParams = [];

    // Build WHERE conditions
    if (is_active !== undefined) {
      whereConditions.push('c.is_active = ?');
      queryParams.push(is_active === 'true');
    }

    if (parent_id !== undefined) {
      if (parent_id === 'null') {
        whereConditions.push('c.parent_id IS NULL');
      } else {
        whereConditions.push('c.parent_id = ?');
        queryParams.push(parseInt(parent_id));
      }
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Get total count for pagination
    const [countResult] = await query(
      `SELECT COUNT(*) as total FROM categories c ${whereClause}`,
      queryParams
    );

    // Get categories
    let categoriesQuery = `
      SELECT 
        c.id, c.name, c.slug, c.description, c.parent_id, 
        c.image_url, c.sort_order, c.is_active, 
        c.created_at, c.updated_at,
        p.name as parent_name
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      ${whereClause}
      ORDER BY c.sort_order ASC, c.name ASC
      LIMIT ? OFFSET ?
    `;

    const categories = await query(
      categoriesQuery,
      [...queryParams, parseInt(limit), offset]
    );

    // If include_children is true, get children for each category
    if (include_children === 'true') {
      const categoryIds = categories.map(cat => cat.id);
      
      if (categoryIds.length > 0) {
        const children = await query(
          `SELECT id, name, slug, parent_id, sort_order, is_active 
           FROM categories 
           WHERE parent_id IN (?) 
           ORDER BY sort_order ASC, name ASC`,
          [categoryIds]
        );

        // Group children by parent_id
        const childrenByParent = children.reduce((acc, child) => {
          if (!acc[child.parent_id]) {
            acc[child.parent_id] = [];
          }
          acc[child.parent_id].push(child);
          return acc;
        }, {});

        // Add children to their parent categories
        categories.forEach(category => {
          category.children = childrenByParent[category.id] || [];
        });
      }
    }

    res.status(200).json({
      message: 'Categories retrieved successfully!',
      data: {
        categories,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.total,
          pages: Math.ceil(countResult.total / limit)
        }
      }
    });
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Get single category by ID or slug
export const getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { include_children = 'false' } = req.query;

    // Determine if we're querying by ID or slug
    const isNumeric = !isNaN(id);
    const field = isNumeric ? 'c.id' : 'c.slug';
    const value = isNumeric ? parseInt(id) : id;

    const [category] = await query(
      `SELECT 
        c.id, c.name, c.slug, c.description, c.parent_id, 
        c.image_url, c.sort_order, c.is_active, 
        c.created_at, c.updated_at,
        p.name as parent_name, p.slug as parent_slug
       FROM categories c
       LEFT JOIN categories p ON c.parent_id = p.id
       WHERE ${field} = ?`,
      [value]
    );

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Include children if requested
    if (include_children === 'true') {
      const children = await query(
        `SELECT id, name, slug, description, parent_id, 
                image_url, sort_order, is_active, created_at
         FROM categories 
         WHERE parent_id = ? 
         ORDER BY sort_order ASC, name ASC`,
        [category.id]
      );
      category.children = children;
    }

    res.status(200).json({
      message: 'Category retrieved successfully!',
      data: { category }
    });
  } catch (err) {
    console.error('Get category error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, parent_id, image_url, sort_order, is_active } = req.body;

    // Check if category exists
    const [existingCategory] = await query(
      'SELECT id, slug FROM categories WHERE id = ?',
      [parseInt(id)]
    );

    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Validate input data
    const validationErrors = validateCategoryData(req.body, true);
    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    // Prevent circular reference (category being its own parent)
    if (parent_id && parseInt(parent_id) === parseInt(id)) {
      return res.status(400).json({ error: 'Category cannot be its own parent' });
    }

    // Validate parent category if provided
    if (parent_id) {
      const parentCategory = await query(
        'SELECT id FROM categories WHERE id = ?',
        [parseInt(parent_id)]
      );

      if (parentCategory.length === 0) {
        return res.status(400).json({ error: 'Parent category not found' });
      }
    }

    // Generate new slug if name is being updated
    let slug = existingCategory.slug;
    if (name) {
      slug = generateSlug(name);

      // Check if new slug already exists (excluding current category)
      const existingSlug = await query(
        'SELECT id FROM categories WHERE slug = ? AND id != ?',
        [slug, parseInt(id)]
      );

      if (existingSlug.length > 0) {
        return res.status(400).json({ error: 'Category with this name already exists' });
      }
    }

    // Build dynamic update query
    const updateFields = [];
    const updateParams = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateParams.push(validator.escape(name.trim()));
    }

    if (slug !== existingCategory.slug) {
      updateFields.push('slug = ?');
      updateParams.push(slug);
    }

    if (description !== undefined) {
      updateFields.push('description = ?');
      updateParams.push(description ? validator.escape(description.trim()) : null);
    }

    if (parent_id !== undefined) {
      updateFields.push('parent_id = ?');
      updateParams.push(parent_id ? parseInt(parent_id) : null);
    }

    if (image_url !== undefined) {
      updateFields.push('image_url = ?');
      updateParams.push(image_url || null);
    }

    if (sort_order !== undefined) {
      updateFields.push('sort_order = ?');
      updateParams.push(parseInt(sort_order));
    }

    if (is_active !== undefined) {
      updateFields.push('is_active = ?');
      updateParams.push(is_active);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateParams.push(parseInt(id));

    await execute(
      `UPDATE categories SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Get updated category
    const [updatedCategory] = await query(
      `SELECT id, name, slug, description, parent_id, image_url, 
              sort_order, is_active, created_at, updated_at
       FROM categories WHERE id = ?`,
      [parseInt(id)]
    );

    res.status(200).json({
      message: 'Category updated successfully!',
      data: { category: updatedCategory }
    });
  } catch (err) {
    console.error('Update category error:', err);
    
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Category name or slug already exists' });
    }
    
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const [existingCategory] = await query(
      'SELECT id FROM categories WHERE id = ?',
      [parseInt(id)]
    );

    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if category has children
    const childCategories = await query(
      'SELECT id FROM categories WHERE parent_id = ?',
      [parseInt(id)]
    );

    if (childCategories.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with subcategories. Please reassign or delete subcategories first.' 
      });
    }

    // Delete the category
    await execute(
      'DELETE FROM categories WHERE id = ?',
      [parseInt(id)]
    );

    res.status(200).json({
      message: 'Category deleted successfully!'
    });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Get category tree (hierarchical structure)
export const getCategoryTree = async (req, res) => {
  try {
    const { is_active = 'true' } = req.query;

    const categories = await query(
      `SELECT id, name, slug, description, parent_id, 
              image_url, sort_order, is_active
       FROM categories 
       WHERE is_active = ?
       ORDER BY sort_order ASC, name ASC`,
      [is_active === 'true']
    );

    // Build hierarchical tree
    const buildTree = (parentId = null) => {
      return categories
        .filter(cat => cat.parent_id === parentId)
        .map(cat => ({
          ...cat,
          children: buildTree(cat.id)
        }));
    };

    const categoryTree = buildTree();

    res.status(200).json({
      message: 'Category tree retrieved successfully!',
      data: { categories: categoryTree }
    });
  } catch (err) {
    console.error('Get category tree error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};