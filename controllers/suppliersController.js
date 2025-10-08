import { query, execute } from '../config/mysql.js';
import validator from 'validator';

// Helper function to validate supplier data
const validateSupplierData = (data, isUpdate = false) => {
  const errors = {};

  // Validate name
  if (!isUpdate || data.name !== undefined) {
    if (!data.name || data.name.trim().length === 0) {
      errors.name = 'Supplier name is required';
    } else if (data.name.length > 100) {
      errors.name = 'Supplier name must be less than 100 characters';
    }
  }

  // Validate contact_person
  if (data.contact_person !== undefined && data.contact_person) {
    if (data.contact_person.length > 100) {
      errors.contact_person = 'Contact person name must be less than 100 characters';
    }
  }

  // Validate email
  if (data.email !== undefined && data.email) {
    if (data.email.length > 100) {
      errors.email = 'Email must be less than 100 characters';
    } else if (!validator.isEmail(data.email)) {
      errors.email = 'Invalid email format';
    }
  }

  // Validate phone
  if (data.phone !== undefined && data.phone) {
    if (data.phone.length > 20) {
      errors.phone = 'Phone number must be less than 20 characters';
    }
  }

  // Validate address
  if (data.address !== undefined && data.address) {
    if (data.address.length > 65535) {
      errors.address = 'Address is too long';
    }
  }

  // Validate city
  if (data.city !== undefined && data.city) {
    if (data.city.length > 50) {
      errors.city = 'City must be less than 50 characters';
    }
  }

  // Validate province
  if (data.province !== undefined && data.province) {
    if (data.province.length > 50) {
      errors.province = 'Province must be less than 50 characters';
    }
  }

  // Validate postal_code
  if (data.postal_code !== undefined && data.postal_code) {
    if (data.postal_code.length > 10) {
      errors.postal_code = 'Postal code must be less than 10 characters';
    }
  }

  // Validate country
  if (data.country !== undefined && data.country) {
    if (data.country.length > 50) {
      errors.country = 'Country must be less than 50 characters';
    }
  }

  // Validate website
  if (data.website !== undefined && data.website) {
    if (data.website.length > 255) {
      errors.website = 'Website URL must be less than 255 characters';
    } else if (!validator.isURL(data.website)) {
      errors.website = 'Invalid website URL format';
    }
  }

  // Validate is_active
  if (data.is_active !== undefined && typeof data.is_active !== 'boolean') {
    errors.is_active = 'is_active must be a boolean value';
  }

  // Validate payment_terms
  if (data.payment_terms !== undefined && data.payment_terms) {
    if (data.payment_terms.length > 65535) {
      errors.payment_terms = 'Payment terms is too long';
    }
  }

  // Validate notes
  if (data.notes !== undefined && data.notes) {
    if (data.notes.length > 65535) {
      errors.notes = 'Notes is too long';
    }
  }

  return errors;
};

// Create a new supplier
export const createSupplier = async (req, res) => {
  try {
    const {
      name,
      contact_person,
      email,
      phone,
      address,
      city,
      province,
      postal_code,
      country,
      website,
      is_active,
      payment_terms,
      notes
    } = req.body;

    // Validate input data
    const validationErrors = validateSupplierData(req.body);
    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors
      });
    }

    // Check if supplier with same name already exists
    const existingSupplier = await query(
      'SELECT id FROM suppliers WHERE name = ?',
      [name.trim()]
    );

    if (existingSupplier.length > 0) {
      return res.status(400).json({ error: 'Supplier with this name already exists' });
    }

    // Insert new supplier
    const result = await execute(
      `INSERT INTO suppliers 
       (name, contact_person, email, phone, address, city, province, 
        postal_code, country, website, is_active, payment_terms, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        validator.escape(name.trim()),
        contact_person ? validator.escape(contact_person.trim()) : null,
        email ? email.trim().toLowerCase() : null,
        phone ? phone.trim() : null,
        address ? validator.escape(address.trim()) : null,
        city ? validator.escape(city.trim()) : null,
        province ? validator.escape(province.trim()) : null,
        postal_code ? postal_code.trim() : null,
        country ? validator.escape(country.trim()) : 'South Africa',
        website ? website.trim() : null,
        is_active !== undefined ? is_active : true,
        payment_terms ? validator.escape(payment_terms.trim()) : null,
        notes ? validator.escape(notes.trim()) : null
      ]
    );

    // Get the newly created supplier
    const [newSupplier] = await query(
      `SELECT id, name, contact_person, email, phone, address, city, province, 
              postal_code, country, website, is_active, payment_terms, notes,
              created_at, updated_at 
       FROM suppliers WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Supplier created successfully!',
      data: { supplier: newSupplier }
    });
  } catch (err) {
    console.error('Create supplier error:', err);

    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Supplier with this name already exists' });
    }

    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Get all suppliers with optional filtering and pagination
export const getSuppliers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      is_active,
      search,
      country,
      province,
      city
    } = req.query;

    const offset = (page - 1) * limit;
    const whereConditions = [];
    const queryParams = [];

    // Build WHERE conditions
    if (is_active !== undefined) {
      whereConditions.push('is_active = ?');
      queryParams.push(is_active === 'true');
    }

    if (search) {
      whereConditions.push('(name LIKE ? OR contact_person LIKE ? OR email LIKE ?)');
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }

    if (country) {
      whereConditions.push('country = ?');
      queryParams.push(country);
    }

    if (province) {
      whereConditions.push('province = ?');
      queryParams.push(province);
    }

    if (city) {
      whereConditions.push('city = ?');
      queryParams.push(city);
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Get total count for pagination
    const [countResult] = await query(
      `SELECT COUNT(*) as total FROM suppliers ${whereClause}`,
      queryParams
    );

    // Get suppliers
    const suppliers = await query(
      `SELECT id, name, contact_person, email, phone, address, city, province,
              postal_code, country, website, is_active, payment_terms, notes,
              created_at, updated_at
       FROM suppliers
       ${whereClause}
       ORDER BY name ASC
       LIMIT ? OFFSET ?`,
      [...queryParams, parseInt(limit), offset]
    );

    res.status(200).json({
      message: 'Suppliers retrieved successfully!',
      data: {
        suppliers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.total,
          pages: Math.ceil(countResult.total / limit)
        }
      }
    });
  } catch (err) {
    console.error('Get suppliers error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Get single supplier by ID
export const getSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const [supplier] = await query(
      `SELECT id, name, contact_person, email, phone, address, city, province,
              postal_code, country, website, is_active, payment_terms, notes,
              created_at, updated_at
       FROM suppliers
       WHERE id = ?`,
      [parseInt(id)]
    );

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.status(200).json({
      message: 'Supplier retrieved successfully!',
      data: { supplier }
    });
  } catch (err) {
    console.error('Get supplier error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Update supplier
export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      contact_person,
      email,
      phone,
      address,
      city,
      province,
      postal_code,
      country,
      website,
      is_active,
      payment_terms,
      notes
    } = req.body;

    // Check if supplier exists
    const [existingSupplier] = await query(
      'SELECT id, name FROM suppliers WHERE id = ?',
      [parseInt(id)]
    );

    if (!existingSupplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    // Validate input data
    const validationErrors = validateSupplierData(req.body, true);
    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors
      });
    }

    // Check if new name already exists (excluding current supplier)
    if (name && name.trim() !== existingSupplier.name) {
      const duplicateName = await query(
        'SELECT id FROM suppliers WHERE name = ? AND id != ?',
        [name.trim(), parseInt(id)]
      );

      if (duplicateName.length > 0) {
        return res.status(400).json({ error: 'Supplier with this name already exists' });
      }
    }

    // Build dynamic update query
    const updateFields = [];
    const updateParams = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateParams.push(validator.escape(name.trim()));
    }

    if (contact_person !== undefined) {
      updateFields.push('contact_person = ?');
      updateParams.push(contact_person ? validator.escape(contact_person.trim()) : null);
    }

    if (email !== undefined) {
      updateFields.push('email = ?');
      updateParams.push(email ? email.trim().toLowerCase() : null);
    }

    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateParams.push(phone ? phone.trim() : null);
    }

    if (address !== undefined) {
      updateFields.push('address = ?');
      updateParams.push(address ? validator.escape(address.trim()) : null);
    }

    if (city !== undefined) {
      updateFields.push('city = ?');
      updateParams.push(city ? validator.escape(city.trim()) : null);
    }

    if (province !== undefined) {
      updateFields.push('province = ?');
      updateParams.push(province ? validator.escape(province.trim()) : null);
    }

    if (postal_code !== undefined) {
      updateFields.push('postal_code = ?');
      updateParams.push(postal_code ? postal_code.trim() : null);
    }

    if (country !== undefined) {
      updateFields.push('country = ?');
      updateParams.push(country ? validator.escape(country.trim()) : null);
    }

    if (website !== undefined) {
      updateFields.push('website = ?');
      updateParams.push(website ? website.trim() : null);
    }

    if (is_active !== undefined) {
      updateFields.push('is_active = ?');
      updateParams.push(is_active);
    }

    if (payment_terms !== undefined) {
      updateFields.push('payment_terms = ?');
      updateParams.push(payment_terms ? validator.escape(payment_terms.trim()) : null);
    }

    if (notes !== undefined) {
      updateFields.push('notes = ?');
      updateParams.push(notes ? validator.escape(notes.trim()) : null);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateParams.push(parseInt(id));

    await execute(
      `UPDATE suppliers SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Get updated supplier
    const [updatedSupplier] = await query(
      `SELECT id, name, contact_person, email, phone, address, city, province,
              postal_code, country, website, is_active, payment_terms, notes,
              created_at, updated_at
       FROM suppliers WHERE id = ?`,
      [parseInt(id)]
    );

    res.status(200).json({
      message: 'Supplier updated successfully!',
      data: { supplier: updatedSupplier }
    });
  } catch (err) {
    console.error('Update supplier error:', err);

    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Supplier with this name already exists' });
    }

    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Delete supplier
export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if supplier exists
    const [existingSupplier] = await query(
      'SELECT id FROM suppliers WHERE id = ?',
      [parseInt(id)]
    );

    if (!existingSupplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }


    const relatedProducts = await query(
      'SELECT id FROM products WHERE supplier_id = ?',
      [parseInt(id)]
    );

    if (relatedProducts.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete supplier with associated products. Please reassign or delete products first.'
      });
    }
    

    // Delete the supplier
    await execute(
      'DELETE FROM suppliers WHERE id = ?',
      [parseInt(id)]
    );

    res.status(200).json({
      message: 'Supplier deleted successfully!'
    });
  } catch (err) {
    console.error('Delete supplier error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Get supplier statistics
export const getSupplierStats = async (req, res) => {
  try {
    const [stats] = await query(
      `SELECT 
        COUNT(*) as total_suppliers,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_suppliers,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_suppliers,
        COUNT(DISTINCT country) as countries,
        COUNT(DISTINCT province) as provinces
       FROM suppliers`
    );

    // Get top countries
    const topCountries = await query(
      `SELECT country, COUNT(*) as count
       FROM suppliers
       WHERE country IS NOT NULL
       GROUP BY country
       ORDER BY count DESC
       LIMIT 5`
    );

    res.status(200).json({
      message: 'Supplier statistics retrieved successfully!',
      data: {
        ...stats,
        top_countries: topCountries
      }
    });
  } catch (err) {
    console.error('Get supplier stats error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};