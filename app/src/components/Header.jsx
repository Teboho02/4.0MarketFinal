import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, LogOut, Settings, Package, Search, X, Menu } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const categories = [
  { label: 'All', path: '/' },
  { label: 'Laptops', path: '/category/laptops' },
  { label: 'Smartphones', path: '/category/smartphones' },
  { label: "PC's & Monitors", path: '/category/PC' },
  { label: 'Accessories', path: '/category/accessories' },
  { label: 'Gaming', path: '/category/gaming' },
]

const Header = () => {
  const { user, logout, isAdmin } = useAuth()
  const { getCartItemCount } = useCart()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchVisible, setSearchVisible] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const lastScrollY = useRef(0)
  const [headerVisible, setHeaderVisible] = useState(true)

  const cartItemCount = getCartItemCount()

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      if (currentY < 10) {
        setHeaderVisible(true)
      } else if (currentY > lastScrollY.current && currentY > 80) {
        setHeaderVisible(false)
      } else {
        setHeaderVisible(true)
      }
      lastScrollY.current = currentY
      setScrolled(currentY > 10)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
    setSidebarOpen(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/category/all?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setSearchVisible(false)
    }
  }

  return (
    <>
      {/* Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-[999] transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: '280px',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          zIndex: 1000,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <Link to="/" onClick={() => setSidebarOpen(false)}>
            <img
              src="/logo.jpg"
              alt="4Markets"
              className="h-10 w-auto"
              onError={(e) => { e.target.style.display = 'none' }}
            />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 py-4">
          {categories.map((cat) => (
            <Link
              key={cat.label}
              to={cat.path}
              onClick={() => { setActiveCategory(cat.label); setSidebarOpen(false) }}
              className={`flex items-center gap-3 px-6 py-3.5 text-sm font-medium transition-all ${
                activeCategory === cat.label
                  ? 'text-blue-600 bg-blue-50 border-r-2 border-blue-600'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              {cat.label}
            </Link>
          ))}

          <div className="border-t border-gray-100 mt-4 pt-4">
            {user && (
              <Link
                to="/orders"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-6 py-3.5 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-all"
              >
                <Package className="w-4 h-4" />
                My Orders
              </Link>
            )}
            {isAdmin && isAdmin() && (
              <Link
                to="/admin"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-6 py-3.5 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-all"
              >
                <Settings className="w-4 h-4" />
                Admin Panel
              </Link>
            )}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="px-6 py-5 border-t border-gray-200">
          {user ? (
            <div>
              <p className="text-sm text-gray-500 mb-3 truncate">{user.email}</p>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link
                to="/login"
                onClick={() => setSidebarOpen(false)}
                className="flex-1 text-center text-sm font-medium py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setSidebarOpen(false)}
                className="flex-1 text-center text-sm font-medium py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Header System */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          transform: headerVisible ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.3s ease',
          backgroundColor: '#ffffff',
          boxShadow: scrolled ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
        }}
      >
        {/* Top Header */}
        <div
          style={{
            padding: '0 1rem',
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            alignItems: 'center',
            gap: '0.75rem',
            height: '64px',
            borderBottom: '1px solid #f3f4f6',
          }}
        >
          {/* Hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center justify-center w-10 h-10 text-gray-700 hover:text-blue-600 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo + Search */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex-shrink-0">
              <img
                src="/logo.jpg"
                alt="4Markets"
                className="h-10 w-auto"
                onError={(e) => { e.target.style.display = 'none' }}
              />
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden sm:flex">
              <div className="flex items-center w-full bg-gray-100 rounded-xl px-3 py-2 gap-2">
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
                />
              </div>
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setSearchVisible(!searchVisible)}
              className="sm:hidden flex items-center justify-center w-9 h-9 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* User / Auth */}
            {user ? (
              <div className="flex items-center gap-1">
                <Link
                  to="/orders"
                  className="flex items-center justify-center w-9 h-9 text-gray-600 hover:text-blue-600 transition-colors"
                  title="My Orders"
                >
                  <Package className="w-5 h-5" />
                </Link>
                {isAdmin && isAdmin() && (
                  <Link
                    to="/admin"
                    className="hidden sm:flex items-center justify-center w-9 h-9 text-gray-600 hover:text-blue-600 transition-colors"
                    title="Admin Panel"
                  >
                    <Settings className="w-5 h-5" />
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="hidden sm:flex items-center justify-center w-9 h-9 text-gray-600 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors px-2 py-1"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-medium bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex items-center justify-center w-9 h-9 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Search Expanded */}
        {searchVisible && (
          <div className="sm:hidden px-4 py-2 border-b border-gray-100">
            <form onSubmit={handleSearch} className="flex items-center bg-gray-100 rounded-xl px-3 py-2 gap-2">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
              />
              <button type="button" onClick={() => setSearchVisible(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </form>
          </div>
        )}

        {/* Categories Nav */}
        <div
          style={{
            borderBottom: '1px solid #e5e7eb',
            padding: '0 1rem',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div className="flex gap-2 whitespace-nowrap">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                to={cat.path}
                onClick={() => setActiveCategory(cat.label)}
                style={{
                  padding: '0.375rem 0.875rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  flexShrink: 0,
                  transition: 'all 0.2s',
                  textDecoration: 'none',
                  backgroundColor: activeCategory === cat.label ? '#2563eb' : 'transparent',
                  color: activeCategory === cat.label ? '#ffffff' : '#6b7280',
                }}
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Header
