import supabase from '../config/supabaseClient.js';

// Helper function for error handling
const handleError = (res, error) => {
  console.error(error);
  return res.status(400).json({ error: error.message });
};

export const getProducts = async (req, res) => {
  try {
    const { data, error } = await supabase.from('products').select('*');
    error ? handleError(res, error) : res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category);
    
    error ? handleError(res, error) : res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return handleError(res, error);
    data 
      ? res.status(200).json(data) 
      : res.status(404).json({ error: 'Product not found' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, category, price, stock, specs, brand, description, image_url } = req.body;
    if (!name || !category || !price || !image_url) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('products')
      .insert([{ 
        name, category, price, 
        stock: stock || 0, 
        specs: specs || '', 
        brand: brand || '', 
        description: description || '', 
        image_url 
      }])
      .select();
    
    error 
      ? handleError(res, error) 
      : res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productData = req.body;
    productData.updated_at = new Date();

    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select();
    
    if (error) return handleError(res, error);
    data.length === 0
      ? res.status(404).json({ error: 'Product not found' })
      : res.status(200).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    error
      ? handleError(res, error)
      : res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};