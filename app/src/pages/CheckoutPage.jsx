import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Truck, Lock, CheckCircle } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const CheckoutPage = () => {
  const navigate = useNavigate()
  const { cart, getCartSummary, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState('shipping')
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    email: user?.email || '',
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'South Africa',
    phone: ''
  })

  const summary = getCartSummary()

  // Calculate order totals directly to ensure consistency
  const calculateOrderTotals = () => {
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

  const orderTotals = calculateOrderTotals()

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

  // Redirect if cart is empty
  if (cart.length === 0) {
    navigate('/cart')
    return null
  }

  // Redirect if not authenticated
  if (!isAuthenticated()) {
    navigate('/login')
    return null
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateShippingForm = () => {
    const required = ['email', 'fullName', 'address', 'city', 'postalCode', 'phone']
    return required.every(field => formData[field].trim())
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateShippingForm()) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Convert total to cents (Yoco requires amount in cents)
      const amountInCents = Math.round(orderTotals.total * 100)
      
      // Get current domain for redirect URLs
      const baseUrl = window.location.origin
      
      // Create order ID
      const orderId = `ORD-${Date.now()}`
      
      // Prepare order data to store temporarily
      const orderData = {
        id: orderId,
        items: cart,
        summary: orderTotals,
        shipping: formData,
        orderDate: new Date().toISOString(),
        status: 'pending'
      }
      
      // Store order data temporarily (will be retrieved on success)
      sessionStorage.setItem('pendingOrder', JSON.stringify(orderData))
      
      // Create Yoco checkout
      const response = await fetch('/api/payments/yoco/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          amount: amountInCents,
          currency: 'ZAR',
          cancelUrl: `${baseUrl}/checkout?cancelled=true`,
          successUrl: `${baseUrl}/payment-success`,
          failureUrl: `${baseUrl}/payment-failed`,
          metadata: {
            orderId: orderId,
            userId: user?.id || 'guest',
            userEmail: formData.email,
            itemCount: cart.length,
            customerName: formData.fullName
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create payment')
      }

      if (data.success && data.redirectUrl) {
        // Store checkout ID for verification
        sessionStorage.setItem('yocoCheckoutId', data.checkoutId)
        
        // Redirect to Yoco payment page
        window.location.href = data.redirectUrl
      } else {
        throw new Error('Invalid response from payment gateway')
      }

    } catch (error) {
      console.error('Payment error:', error)
      setError(error.message || 'Failed to initiate payment. Please try again.')
      setLoading(false)
    }
  }

  const steps = [
    { id: 'shipping', title: 'Shipping', icon: Truck, completed: currentStep !== 'shipping' },
    { id: 'payment', title: 'Payment', icon: CreditCard, completed: false },
    { id: 'confirmation', title: 'Confirmation', icon: CheckCircle, completed: false }
  ]

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: currentStep === 'payment' ? '50%' : '0%' }}
              />
            </div>
            
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = step.completed
              
              return (
                <div key={step.id} className="relative bg-white">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    isActive 
                      ? 'border-blue-600 bg-blue-600 text-white' 
                      : isCompleted
                      ? 'border-green-600 bg-green-600 text-white'
                      : 'border-gray-300 bg-white text-gray-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`absolute top-12 left-1/2 transform -translate-x-1/2 text-sm font-medium whitespace-nowrap ${
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* Shipping Information */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Shipping Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Country</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="South Africa">South Africa</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="+27 12 345 6789"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Secure Payment
                </h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Lock className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-blue-900 font-medium mb-1">
                        Secure Payment with Yoco
                      </p>
                      <p className="text-xs text-blue-700">
                        You'll be redirected to Yoco's secure payment page to complete your purchase. 
                        All card details are encrypted and securely processed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full text-lg py-3 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="spinner mr-2 w-5 h-5" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    Proceed to Payment - {formatPrice(orderTotals.total)}
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By completing this purchase, you agree to our terms and conditions
              </p>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.images?.[0] || item.image_url || item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/48x48/6c757d/ffffff?text=${encodeURIComponent(item.name.charAt(0))}`
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-medium">
                      {formatPrice((parseFloat(item.retail_price) || 0) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({orderTotals.itemCount} items)</span>
                  <span>{formatPrice(orderTotals.subtotal)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>{formatPrice(orderTotals.shipping)}</span>
                </div>
                
                <div className="flex justify-between text-xl font-bold border-t border-gray-200 pt-3">
                  <span>Total</span>
                  <span>{formatPrice(orderTotals.total)}</span>
                </div>
              </div>

              {/* Payment Security Badges */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                  <Lock className="w-4 h-4" />
                  <span>Secured by Yoco Payments</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage