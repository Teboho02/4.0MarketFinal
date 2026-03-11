// SupplierService.js
const API_BASE_URL = '/api';

class SupplierService {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/suppliers`;
  }

  getAuthToken() {
    return sessionStorage.getItem('token') || localStorage.getItem('token');
  }

  buildHeaders(requireAuth = false) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (requireAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async handleResponse(response) {
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  async getSuppliers(params = {}, signal = null) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const url = `${this.baseUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const fetchOptions = {
        method: 'GET',
        headers: this.buildHeaders(false),
      };

      // Add abort signal if provided
      if (signal) {
        fetchOptions.signal = signal;
      }

      const response = await fetch(url, fetchOptions);

      // Return the full response so we can access both suppliers and pagination
      return await this.handleResponse(response);
    } catch (error) {
      // Re-throw AbortError so it can be handled properly
      if (error.name === 'AbortError') {
        throw error;
      }
      console.error('Error fetching suppliers:', error);
      throw error;
    }
  }

  async getSupplier(id) {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'GET',
        headers: this.buildHeaders(false),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching supplier:', error);
      throw error;
    }
  }

  async createSupplier(supplierData) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.buildHeaders(true),
        body: JSON.stringify(supplierData),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
  }

  async updateSupplier(id, supplierData) {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: this.buildHeaders(true),
        body: JSON.stringify(supplierData),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw error;
    }
  }

  async deleteSupplier(id) {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: this.buildHeaders(true),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error deleting supplier:', error);
      throw error;
    }
  }

  async getSupplierStats() {
    try {
      const response = await fetch(`${this.baseUrl}/stats`, {
        method: 'GET',
        headers: this.buildHeaders(false),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching supplier stats:', error);
      throw error;
    }
  }

  async getSuppliersByCountry(country) {
    try {
      return await this.getSuppliers({ country });
    } catch (error) {
      console.error('Error fetching suppliers by country:', error);
      throw error;
    }
  }

  async getSuppliersByProvince(province) {
    try {
      return await this.getSuppliers({ province });
    } catch (error) {
      console.error('Error fetching suppliers by province:', error);
      throw error;
    }
  }

  async getActiveSuppliers() {
    try {
      return await this.getSuppliers({ is_active: 1 });
    } catch (error) {
      console.error('Error fetching active suppliers:', error);
      throw error;
    }
  }

  async searchSuppliers(searchTerm) {
    try {
      return await this.getSuppliers({ search: searchTerm });
    } catch (error) {
      console.error('Error searching suppliers:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const supplierService = new SupplierService();
