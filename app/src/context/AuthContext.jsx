import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state from sessionStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = sessionStorage.getItem('token')
        const storedEmail = sessionStorage.getItem('email')
        
        if (storedToken && storedEmail) {
          setToken(storedToken)
          setUser({ 
            email: JSON.parse(storedEmail),
            token: storedToken 
          })
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        // Clear invalid data
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('email')
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (email, password) => {
    try {
      setLoading(true)
      const response = await authService.login(email, password)
      
      // Handle the response structure from your backend
      if (response.session?.access_token) {
        const authToken = response.session.access_token
        const userEmail = response.user?.email || email
        
        setToken(authToken)
        setUser({ 
          email: userEmail, 
          token: authToken,
          id: response.user?.id,
          ...response.user 
        })
        
        // Store in sessionStorage
        sessionStorage.setItem('token', authToken)
        sessionStorage.setItem('email', JSON.stringify(userEmail))
        
        return { success: true, user: response.user }
      } else if (response.token) {
        // Alternative response structure
        setToken(response.token)
        setUser({ 
          email: response.email || email, 
          token: response.token,
          ...response.user 
        })
        
        sessionStorage.setItem('token', response.token)
        sessionStorage.setItem('email', JSON.stringify(response.email || email))
        
        return { success: true, user: response.user }
      } else {
        throw new Error('No valid token received from server')
      }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Login failed' 
      }
    } finally {
      setLoading(false)
    }
  }

  const signup = async (userData) => {
    try {
      setLoading(true)
      const response = await authService.signup(userData)
      
      // Handle signup response based on your backend
      if (response.session?.access_token) {
        const authToken = response.session.access_token
        const userEmail = response.user?.email || userData.email
        
        setToken(authToken)
        setUser({ 
          email: userEmail, 
          token: authToken,
          id: response.user?.id,
          ...response.user 
        })
        
        sessionStorage.setItem('token', authToken)
        sessionStorage.setItem('email', JSON.stringify(userEmail))
        
        return { success: true, user: response.user }
      } else if (response.token) {
        // Alternative response structure
        setToken(response.token)
        setUser({ 
          email: response.email || userData.email, 
          token: response.token 
        })
        
        sessionStorage.setItem('token', response.token)
        sessionStorage.setItem('email', JSON.stringify(response.email || userData.email))
        
        return { success: true, user: response.user }
      } else if (response.success && response.requiresVerification) {
        // Account created but requires email verification
        return { 
          success: true, 
          message: response.message || 'Account created successfully! Please check your email to verify your account.',
          requiresVerification: true 
        }
      } else if (response.success) {
        // Account created successfully
        return { 
          success: true, 
          message: response.message || 'Account created successfully!'
        }
      } else {
        throw new Error('Unexpected response format')
      }
    } catch (error) {
      console.error('Signup error:', error)
      
      // Handle specific error messages
      let errorMessage = 'Signup failed'
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.message) {
        errorMessage = error.message
      }
      
      // Handle common Supabase errors
      if (errorMessage.includes('User already registered')) {
        errorMessage = 'An account with this email already exists'
      } else if (errorMessage.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address'
      } else if (errorMessage.includes('Password should be at least')) {
        errorMessage = 'Password must be at least 8 characters long'
      }
      
      return { 
        success: false, 
        error: errorMessage
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('email')
    authService.logout() // Call backend logout if needed
  }

  const isAuthenticated = () => {
    return !!(user && token)
  }

  const isAdmin = () => {
    // Check admin status - you can customize this logic
    return user && (
      user.role === 'admin' || 
      user.email?.includes('admin') ||
      user.isAdmin === true ||
      user.email === 'admin@bazara.com' // Your demo admin
    )
  }

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    isAuthenticated,
    isAdmin
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
