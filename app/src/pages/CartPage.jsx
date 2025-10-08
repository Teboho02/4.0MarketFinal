import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'

const CartPage = () => {
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartSummary 
  } = useCart()

  const summary = getCartSummary()

  const formatPrice = (price) => {
    const numericPrice = parseFloat(price)
    if (isNaN(numericPrice)) {
      return 'R0.00'
    }
    return `R${numericPrice.toLocaleString('en-ZA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  }

  // Calculate cart totals directly for the order summary
  const calculateOrderSummary = () => {
    const subtotal = cart.reduce((total, item) => {
      const price = parseFloat(item.retail_price) || 0
      return total + (price * item.quantity)
    }, 0)
    
    const shipping = 50.00 // Fixed R50 shipping
    const total = subtotal + shipping
    
    return {
      subtotal,
      shipping,
      total,
      itemCount: cart.reduce((count, item) => count + item.quantity, 0)
    }
  }

  const orderSummary = calculateOrderSummary()

  const handleQuantityChange = (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change
    if (newQuantity <= 0) {
      removeFromCart(productId)
    } else {
      updateQuantity(productId, newQuantity)
    }
  }

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart()
    }
  }

  if (cart.length === 0) {
    return (
      <div className="pt-16 min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link
              to="/"
              className="btn btn-primary inline-flex items-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Shopping Cart ({orderSummary.itemCount} items)
                  </h1>
                  <button
                    onClick={handleClearCart}
                    className="text-red-600 hover:text-red-800 font-medium transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {cart.map((item) => (
                  <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.images?.[0] || item.image_url || item.image}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = `https://via.placeholder.com/96x96/6c757d/ffffff?text=${encodeURIComponent(item.name.charAt(0))}`
                        }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <div className="mb-4 sm:mb-0">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {item.name}
                          </h3>
                          {item.brand && (
                            <p className="text-sm text-blue-600 font-medium">
                              {item.brand}
                            </p>
                          )}
                          {item.specifications && (
                            <p className="text-sm text-gray-600 mt-1">
                              {item.specifications}
                            </p>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900 mb-2">
                            {formatPrice((parseFloat(item.retail_price) || 0) * item.quantity)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatPrice(item.retail_price)} each
                          </div>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          
                          <span className="font-semibold text-gray-900 min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="flex items-center space-x-1 text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-sm font-medium">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-96">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({orderSummary.itemCount} items)</span>
                  <span>{formatPrice(orderSummary.subtotal)}</span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{formatPrice(orderSummary.shipping)}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(orderSummary.total)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  to="/checkout"
                  className="btn btn-primary w-full text-center"
                >
                  Proceed to Checkout
                </Link>
                
                <Link
                  to="/"
                  className="btn btn-secondary w-full text-center"
                >
                  Continue Shopping
                </Link>
              </div>

              {/* Security Notice */}
              <div className="mt-6 text-xs text-gray-500 text-center">
                <p>🔒 Secure checkout with 256-bit SSL encryption</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage