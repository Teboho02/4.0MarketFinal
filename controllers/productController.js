import { query, execute } from '../config/mysql.js';
import { randomUUID } from 'crypto';
import { uploadToLightsail, deleteFromLightsail } from '../config/lightsail.js';

// Helper function for error handling
const handleError = (res, error) => {
  console.error(error);
  return res.status(400).json({ error: error.message });
};

// Helper function to calculate profit
const calculateProfitMargin = (wholesalePrice, retailPrice) => {
  const profit = retailPrice - wholesalePrice;
  const percentage = ((profit / wholesalePrice) * 100).toFixed(1);
  return {
    amount: parseFloat(profit.toFixed(2)),
    percentage: `${percentage}%`
  };
};
// GET all products
export const getProducts = async (req, res) => {
  try {
    const sql = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        s.name as supplier_name,
        (SELECT GROUP_CONCAT(t.name) 
         FROM tags t 
         INNER JOIN product_tags pt ON t.id = pt.tag_id 
         WHERE pt.product_id = p.id) as tags,
        (SELECT GROUP_CONCAT(pi.image_url ORDER BY pi.sort_order) 
         FROM product_images pi 
         WHERE pi.product_id = p.id) as images
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.is_active = TRUE
      ORDER BY p.created_at DESC
    `;

    const products = await query(sql);

    console.log('Fetched products:', products);

    // Format response with profit calculation
    const formattedProducts = products.map(product => {
      // Helper function to safely parse JSON
      const safeJsonParse = (value) => {
        if (!value) return {};
        if (typeof value === 'object') return value;
        try {
          return JSON.parse(value);
        } catch (e) {
          console.warn('Failed to parse JSON:', value);
          return {};
        }
      };

      return {
        ...product,
        tags: product.tags ? product.tags.split(',') : [],
        images: product.images ? product.images.split(',') : [],
        profit: calculateProfitMargin(product.wholesale_price, product.retail_price),
        specifications: safeJsonParse(product.specifications),
        dimensions: safeJsonParse(product.dimensions)
      };
    });

    res.status(200).json(formattedProducts);
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
// GET products by category
export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const sql = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        s.name as supplier_name,
        (SELECT GROUP_CONCAT(t.name) 
         FROM tags t 
         INNER JOIN product_tags pt ON t.id = pt.tag_id 
         WHERE pt.product_id = p.id) as tags,
        (SELECT GROUP_CONCAT(pi.image_url ORDER BY pi.sort_order) 
         FROM product_images pi 
         WHERE pi.product_id = p.id) as images
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.is_active = TRUE AND c.slug = ?
      ORDER BY p.created_at DESC
    `;

    const products = await query(sql, [category]);

    console.log('Fetched products by category:', products);
    
    const formattedProducts = products.map(product => {
      // Helper function to safely parse JSON
      const safeJSONParse = (value, fallback = {}) => {
        if (!value) return fallback;
        if (typeof value === 'object') return value;
        try {
          return JSON.parse(value);
        } catch (e) {
          console.warn(`Failed to parse JSON for product ${product.id}:`, value);
          return fallback;
        }
      };

      return {
        ...product,
        tags: product.tags ? product.tags.split(',') : [],
        images: product.images ? product.images.split(',') : [],
        profit: calculateProfitMargin(product.wholesale_price, product.retail_price),
        specifications: safeJSONParse(product.specifications, {}),
        dimensions: safeJSONParse(product.dimensions, {})
      };
    });

    res.status(200).json(formattedProducts);
  } catch (err) {
    console.error('Get products by category error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// GET single product by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        s.name as supplier_name,
        s.email as supplier_email,
        s.phone as supplier_phone
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.id = ? AND p.is_active = TRUE
    `;

    const products = await query(sql, [id]);

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = products[0];

    // Get images
    const images = await query(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order',
      [product.id]
    );

    // Get tags
    const tags = await query(
      `SELECT t.* FROM tags t
       INNER JOIN product_tags pt ON t.id = pt.tag_id
       WHERE pt.product_id = ?`,
      [product.id]
    );

    // Helper function to safely parse JSON
    const safeParseJSON = (value) => {
      if (!value) return {};
      if (typeof value === 'object') return value; // Already parsed
      try {
        return JSON.parse(value); // Try to parse if it's a string
      } catch {
        return {}; // Return empty object if parsing fails
      }
    };

    const formattedProduct = {
      ...product,
      images: images.map(img => img.image_url),
      image_objects: images,
      tags: tags.map(tag => tag.name),
      tag_objects: tags,
      profit: calculateProfitMargin(product.wholesale_price, product.retail_price),
      specifications: safeParseJSON(product.specifications),
      dimensions: safeParseJSON(product.dimensions)
    };

    res.status(200).json(formattedProduct);
  } catch (err) {
    console.error('Get product by ID error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// CREATE product with image upload
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category_id,
      brand,
      specifications,
      wholesale_price,
      retail_price,
      cost_price,
      stock_quantity,
      min_stock_level,
      max_stock_level,
      sku,
      supplier_sku,
      supplier_id,
      weight_kg,
      dimensions,
      insurance_type,
      is_featured,
      meta_title,
      meta_description,
      search_keywords
    } = req.body;

    // Handle tags - can come as array or JSON string
    let tags = [];
    if (req.body.tags) {
      if (Array.isArray(req.body.tags)) {
        tags = req.body.tags;
      } else if (typeof req.body.tags === 'string') {
        try {
          tags = JSON.parse(req.body.tags);
        } catch (e) {
          console.error('Failed to parse tags:', e);
        }
      }
    }
    // Also check for tags[] format (from FormData repeated fields)
    if (req.body['tags[]']) {
      tags = Array.isArray(req.body['tags[]']) ? req.body['tags[]'] : [req.body['tags[]']];
    }

    // Validation
    if (!name || !category_id || !retail_price || !wholesale_price || !sku ) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, category_id, retail_price, wholesale_price, sku, supplier_id' 
      });
    }

    // ==========================================
    // VALIDATE FOREIGN KEY REFERENCES
    // ==========================================
    
    // 1. Validate category_id exists
    const [categoryCheck] = await query(
      'SELECT id FROM categories WHERE id = ? AND is_active = TRUE',
      [category_id]
    );
    
    if (!categoryCheck) {
      return res.status(400).json({ 
        error: `Invalid category_id: ${category_id}. Category does not exist or is inactive.` 
      });
    }

    // 2. Validate supplier_id exists
    // const [supplierCheck] = await query(
    //   'SELECT id FROM suppliers WHERE id = ? AND is_active = TRUE',
    //   [supplier_id]
    // );
    
    // if (!supplierCheck) {
    //   return res.status(400).json({ 
    //     error: `Invalid supplier_id: ${supplier_id}. Supplier does not exist or is inactive.` 
    //   });
    // }

    // 3. Validate created_by user exists (if provided)
    let validatedUserId = null;
    if (req.user?.id) {
      const [userCheck] = await query(
        'SELECT id FROM users WHERE id = ? AND is_active = TRUE',
        [req.user.id]
      );
      
      if (userCheck) {
        validatedUserId = req.user.id;
      }
    }

    // 4. Check if SKU already exists
    const [skuCheck] = await query(
      'SELECT id FROM products WHERE sku = ?',
      [sku]
    );
    
    if (skuCheck) {
      return res.status(400).json({ 
        error: `SKU '${sku}' already exists. Please use a unique SKU.` 
      });
    }

    // ==========================================
    // PROCEED WITH INSERT
    // ==========================================

    const productId = randomUUID();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Handle image uploads from req.files
    const uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        try {
          const imageUrl = await uploadToLightsail(file, `products/${productId}`);
          uploadedImages.push({
            url: imageUrl,
            is_primary: i === 0,
            sort_order: i
          });
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          // Continue without failing the entire product creation
        }
      }
    }

    // Insert product with validated foreign keys
    await execute(
      `INSERT INTO products (
        id, name, slug, description, category_id, brand, specifications,
        wholesale_price, retail_price, cost_price, stock_quantity,
        min_stock_level, max_stock_level, sku, supplier_sku, supplier_id,
        weight_kg, dimensions, insurance_type, is_featured,
        meta_title, meta_description, search_keywords, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productId, 
        name, 
        slug, 
        description || '', 
        category_id, 
        brand || '',
        JSON.stringify(specifications || {}), 
        wholesale_price, 
        retail_price,
        cost_price || wholesale_price, 
        stock_quantity || 0, 
        min_stock_level || 5, 
        max_stock_level || 100,
        sku, 
        supplier_sku || '', 
         1,  
        weight_kg || null,
        JSON.stringify(dimensions || {}), 
        insurance_type || 'none', 
        is_featured || false,
        meta_title || name, 
        meta_description || description, 
        search_keywords || '', 
        validatedUserId  // Use validated user ID (can be null)
      ]
    );

    // Insert images
    for (const image of uploadedImages) {
      await execute(
        'INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES (?, ?, ?, ?, ?)',
        [productId, image.url, name, image.is_primary, image.sort_order]
      );
    }

    // Insert tags (validate tag IDs if provided)
    // Parse tags if they come as JSON string
    let parsedTags = tags;
    if (typeof tags === 'string') {
      try {
        parsedTags = JSON.parse(tags);
      } catch (e) {
        console.error('Failed to parse tags:', e);
        parsedTags = [];
      }
    }
    
    if (Array.isArray(parsedTags) && parsedTags.length > 0) {
      for (const tagId of parsedTags) {
        // Skip if tagId is not a valid number or string representation of number
        const numericTagId = parseInt(tagId);
        if (isNaN(numericTagId)) {
          console.warn(`Invalid tag ID: ${tagId}`);
          continue;
        }
        
        // Validate tag exists
        const [tagCheck] = await query('SELECT id FROM tags WHERE id = ?', [numericTagId]);
        if (tagCheck) {
          await execute(
            'INSERT INTO product_tags (product_id, tag_id) VALUES (?, ?)',
            [productId, numericTagId]
          );
        } else {
          console.warn(`Tag ID ${numericTagId} does not exist in database`);
        }
      }
    }

    // Create inventory transaction
    if (stock_quantity && stock_quantity > 0) {
      await execute(
        `INSERT INTO inventory_transactions (
          product_id, transaction_type, quantity, cost_per_unit, 
          reference_type, created_by
        ) VALUES (?, 'adjustment', ?, ?, 'manual', ?)`,
        [productId, stock_quantity, cost_price || wholesale_price, validatedUserId]
      );
    }

    // Get created product with all details
    const [newProduct] = await query(
      `SELECT p.*, 
        c.name as category_name,
        s.name as supplier_name,
        GROUP_CONCAT(DISTINCT pi.image_url) as image_urls
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.id = ?
      GROUP BY p.id`,
      [productId]
    );

    const imageUrlsArray = newProduct.image_urls ? newProduct.image_urls.split(',') : [];

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: {
        ...newProduct,
        images: imageUrlsArray,
        profit_margin: calculateProfitMargin(wholesale_price, retail_price)
      }
    });

  } catch (err) {
    console.error('Create product error:', err);
    
    // Provide more specific error messages
    if (err.code === 'ER_NO_REFERENCED_ROW') {
      return res.status(400).json({ 
        error: 'Foreign key constraint failed. Please ensure category, supplier, and user references are valid.' 
      });
    }
    
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        error: 'Duplicate entry. SKU or slug already exists.' 
      });
    }

    res.status(500).json({ 
      error: 'Internal server error while creating product.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// // Helper function to calculate profit margin
// function calculateProfitMargin(wholesale, retail) {
//   if (!wholesale || !retail) return null;
//   const margin = ((retail - wholesale) / wholesale * 100).toFixed(2);
//   return `${margin}%`;
// }

// UPDATE product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productData = req.body;

    // Check if product exists
    const existing = await query('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Build dynamic update query
    const fields = [];
    const values = [];

    const allowedFields = [
      'name', 'description', 'category_id', 'brand', 'wholesale_price',
      'retail_price', 'cost_price', 'stock_quantity', 'min_stock_level',
      'max_stock_level', 'supplier_id', 'weight_kg', 'insurance_type',
      'is_active', 'is_featured', 'meta_title', 'meta_description', 
      'search_keywords', 'sku', 'supplier_sku'
    ];

    for (const field of allowedFields) {
      if (productData[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(productData[field]);
      }
    }

    if (productData.specifications) {
      fields.push('specifications = ?');
      values.push(JSON.stringify(productData.specifications));
    }

    if (productData.dimensions) {
      fields.push('dimensions = ?');
      values.push(JSON.stringify(productData.dimensions));
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const imageUrl = await uploadToLightsail(file, `products/${id}`);
        await execute(
          'INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES (?, ?, ?, ?, ?)',
          [id, imageUrl, existing[0].name, i === 0, i]
        );
      }
    }

    if (fields.length > 0) {
      values.push(id);
      await execute(
        `UPDATE products SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );
    }

    // Get updated product
    const [updatedProduct] = await query('SELECT * FROM products WHERE id = ?', [id]);
    const images = await query('SELECT image_url FROM product_images WHERE product_id = ?', [id]);

    res.status(200).json({
      ...updatedProduct,
      images: images.map(img => img.image_url),
      profit: calculateProfitMargin(updatedProduct.wholesale_price, updatedProduct.retail_price)
    });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// DELETE product (soft delete)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await execute('UPDATE products SET is_active = FALSE WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};