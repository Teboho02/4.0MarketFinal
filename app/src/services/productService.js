import api from './authService'

export const productService = {
  async getAllProducts() {
    try {
      const response = await api.get('/api/products')
      return response.data
    } catch (error) {
      throw error
    }
  },

  async getProductsByCategory(category) {
    try {
      const response = await api.get(`/api/products/category/${category}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  async getProductById(id) {
    try {
      const response = await api.get(`/api/products/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  async createProduct(productData) {
    try {
      const response = await api.post('/api/products', productData)
      return response.data
    } catch (error) {
      throw error
    }
  },

  async updateProduct(id, productData) {
    try {
      const response = await api.put(`/api/products/${id}`, productData)
      return response.data
    } catch (error) {
      throw error
    }
  },

  async deleteProduct(id) {
    try {
      const response = await api.delete(`/api/products/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  async uploadImage(imageFile) {
    try {
      const formData = new FormData()
      formData.append('file', imageFile)
      
      const response = await api.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      // Handle the response structure
      if (response.data.files && response.data.files.length > 0) {
        return response.data.files[0].url
      } else if (response.data.url) {
        return response.data.url
      } else {
        throw new Error('No URL returned from upload')
      }
    } catch (error) {
      throw error
    }
  }
}