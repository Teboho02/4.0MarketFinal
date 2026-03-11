import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ShoppingBag, Zap, Shield, Truck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const from = location.state?.from?.pathname || '/'

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await login(formData.email, formData.password)
      if (result.success) {
        navigate(from, { replace: true })
      } else {
        setError(result.error || 'Login failed')
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { icon: Zap, text: 'Fast & secure checkout' },
    { icon: Shield, text: 'Buyer protection guarantee' },
    { icon: Truck, text: 'Nationwide delivery' },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 flex-col items-center justify-center p-12 text-white">
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full" />
        <div className="absolute -bottom-32 -right-16 w-96 h-96 bg-white/10 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full" />

        <div className="relative z-10 max-w-md text-center">
          {/* Logo */}
          <Link to="/" className="inline-block mb-10">
            <img
              src="/images/logo4.png"
              alt="Logo"
              className="h-14 mx-auto brightness-0 invert"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          </Link>

          <div className="mb-8 flex justify-center">
            <div className="bg-white/20 p-5 rounded-2xl backdrop-blur-sm">
              <ShoppingBag className="h-14 w-14 text-white" />
            </div>
          </div>

          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Your tech marketplace awaits
          </h2>
          <p className="text-blue-100 text-lg mb-10 leading-relaxed">
            Discover the latest gadgets and electronics from verified suppliers across South Africa.
          </p>

          <div className="space-y-4 text-left">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-blue-100 font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-8 lg:px-16">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-block">
              <img
                src="/images/logo4.png"
                alt="Logo"
                className="h-10 mx-auto"
                onError={(e) => (e.target.style.display = 'none')}
              />
            </Link>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl px-8 py-10 sm:px-10">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
              <p className="text-gray-500 mt-1 text-sm">Sign in to continue to your account</p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
                <svg className="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4.5 w-4.5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <a href="#" className="text-xs text-blue-600 hover:text-blue-500 font-medium">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4.5 w-4.5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2.5 text-sm text-gray-600 cursor-pointer select-none">
                  Keep me signed in
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">New here?</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Sign up CTA */}
            <Link
              to="/signup"
              className="w-full flex items-center justify-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Create an account
            </Link>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            By signing in, you agree to our{' '}
            <a href="/terms" className="text-blue-500 hover:underline">Terms</a>
            {' '}and{' '}
            <a href="/privacy" className="text-blue-500 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
