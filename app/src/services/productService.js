// services/productService.js
const API_BASE_URL = 'http://localhost:4000/api';

const getAuthHeaders = () => {
  const token = sessionStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch (e) {
      // If response is not JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return await response.json();
};

export const productService = {
  // Get all products
  async getAllProducts() {
    try {
      console.log('Fetching products from:', `${API_BASE_URL}/products`);
      const response = await fetch(`${API_BASE_URL}/products`);
      console.log('Response status:', response.status);
      return await handleResponse(response);
    } catch (error) {
      console.error('Error in getAllProducts:', error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  },

  // Get products by category
  async getProductsByCategory(category) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/category/${category}`);
      return await handleResponse(response);
    } catch (error) {
      console.error('Error in getProductsByCategory:', error);
      throw new Error(`Failed to fetch products by category: ${error.message}`);
    }
  },

  // Get single product
  async getProduct(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      return await handleResponse(response);
    } catch (error) {
      console.error('Error in getProduct:', error);
      throw new Error(`Failed to fetch product: ${error.message}`);
    }
  },

  // Create product with images
  async createProduct(productData, imageFiles) {
    try {
      const formData = new FormData();
      
      // Add product fields
      const appendField = (key, value) => {
        if (value === undefined || value === null) return;
        if (key === 'tags' || key === 'specifications' || key === 'dimensions') {
          const serialized = typeof value === 'string' ? value : JSON.stringify(value);
          formData.append(key, serialized);
          return;
        }
        formData.append(key, value);
      };

      Object.keys(productData).forEach(key => {
        appendField(key, productData[key]);
      });
      
      // Add image files
      if (imageFiles && imageFiles.length > 0) {
        imageFiles.forEach((file) => {
          formData.append('images', file);
        });
      }

      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error in createProduct:', error);
      throw new Error(`Failed to create product: ${error.message}`);
    }
  },

  // Update product
  async updateProduct(id, productData, imageFiles) {
    try {
      const formData = new FormData();
      
      const appendField = (key, value) => {
        if (value === undefined || value === null) return;
        if (key === 'tags' || key === 'specifications' || key === 'dimensions') {
          const serialized = typeof value === 'string' ? value : JSON.stringify(value);
          formData.append(key, serialized);
          return;
        }
        formData.append(key, value);
      };

      Object.keys(productData).forEach(key => {
        appendField(key, productData[key]);
      });
      
      if (imageFiles && imageFiles.length > 0) {
        imageFiles.forEach((file) => {
          formData.append('images', file);
        });
      }

      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: formData
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error in updateProduct:', error);
      throw new Error(`Failed to update product: ${error.message}`);
    }
  },

  // Delete product
  async deleteProduct(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error in deleteProduct:', error);
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  }
};
