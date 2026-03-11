import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export const authService = {
  async login(email, password) {
    try {
      const response = await api.post('/login', {
        email,
        password
      })
      
      // Handle the backend response structure
      if (response.data.session?.access_token) {
        return {
          session: response.data.session,
          user: response.data.user,
          token: response.data.session.access_token,
          email: response.data.user.email
        }
      }
      
      return response.data
    } catch (error) {
      throw error
    }
  },

  async signup(userData) {
    try {
      // Validate password length before sending (backend requires 8+)
      if (userData.password.length < 8) {
        throw new Error('Password must be at least 8 characters long')
      }

      const response = await api.post('/createAccount', {
        email: userData.email,
        password: userData.password,
        fullname: `${userData.firstName} ${userData.lastName}`
      })
      
      // Handle the backend response structure based on your backend code
      if (response.data.data?.session?.access_token) {
        return {
          session: response.data.data.session,
          user: response.data.data.user,
          token: response.data.data.session.access_token,
          email: response.data.data.user.email,
          success: true
        }
      } else if (response.data.data?.user) {
        // Account created but no session (email verification required)
        return {
          success: true,
          message: response.data.message || 'Account created successfully! Please check your email to verify your account.',
          requiresVerification: true,
          user: response.data.data.user
        }
      }
      
      return {
        success: true,
        message: response.data.message || 'Account created successfully!',
        data: response.data
      }
    } catch (error) {
      // Handle specific error cases
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.error || 'Invalid input data'
        throw new Error(errorMessage)
      }
      throw error
    }
  },

  async logout() {
    try {
      // Since you're using Supabase auth, we don't need a logout endpoint
      // Just clear local storage
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
    }
  },

  async verifyToken(token) {
    try {
      const response = await api.get('/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export default api
