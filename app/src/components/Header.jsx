import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, LogOut, Settings } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const Header = () => {
    const { user, logout, isAdmin } = useAuth()
    const { getCartItemCount } = useCart()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const cartItemCount = getCartItemCount()

    return (
        <header className="bg-white shadow-md fixed w-full top-0 z-50">
            <div className="container mx-auto">
                <div className="flex justify-between items-center h-16 px-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <img
                            src="/logo.jpg"
                            alt="Bazara Logo"
                            className="h-16 w-auto mr-2"
                            onError={(e) => {
                                e.target.style.display = 'none'
                            }}
                        />


                    </Link>

                    {/* Navigation */}
                    <nav className="flex items-center space-x-6">
                        {/* Category Links */}
                        <div className="hidden md:flex space-x-4">
                            <Link
                                to="/category/laptops"
                                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                            >
                                Laptops
                            </Link>
                            <Link
                                to="/category/smartphones"
                                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                            >
                                Smartphones
                            </Link>
                            <Link
                                to="/category/PC"
                                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                            >
                                PC's and Monitors
                            </Link>
                            <Link
                                to="/category/accessories"
                                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                            >
                                Accessories
                            </Link>
                        </div>

                        {/* User Actions */}
                        <div className="flex items-center space-x-4">
                            {user ? (
                                <div className="flex items-center space-x-3">
                                    {/* User Email */}
                                    <span className="hidden sm:block text-sm text-gray-600">
                                        {user.email}
                                    </span>

                                    {/* Admin Link */}
                                    {isAdmin() && (
                                        <Link
                                            to="/admin"
                                            className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                                            title="Admin Panel"
                                        >
                                            <Settings className="w-5 h-5" />
                                        </Link>
                                    )}

                                    {/* Logout */}
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center text-gray-700 hover:text-red-600 transition-colors"
                                        title="Logout"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <Link
                                        to="/login"
                                        className="btn btn-secondary"
                                    >
                                        <User className="w-4 h-4 mr-1" />
                                        Login
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="btn btn-primary"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}

                            {/* Cart */}
                            <Link
                                to="/cart"
                                className="relative flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                            >
                                <ShoppingCart className="w-6 h-6" />
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                        {cartItemCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    )
}

export default Header