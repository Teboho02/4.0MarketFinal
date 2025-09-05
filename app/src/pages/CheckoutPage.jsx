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
  
  const [formData, setFormData] = useState({
    email: user?.email || '',
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'South Africa',
    phone: '',
    paymentMethod: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  })

  const summary = getCartSummary()

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

  const formatPrice = (price) => {
    return `R${parseFloat(price).toLocaleString('en-ZA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    let formatted = ''
    
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' '
      }
      formatted += value[i]
    }
    
    setFormData(prev => ({
      ...prev,
      cardNumber: formatted
    }))
  }

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4)
    }
    
    setFormData(prev => ({
      ...prev,
      expiryDate: value
    }))
  }

  const validateShippingForm = () => {
    const required = ['email', 'fullName', 'address', 'city', 'postalCode', 'phone']
    return required.every(field => formData[field].trim())
  }

  const validatePaymentForm = () => {
    if (formData.paymentMethod === 'card') {
      const required = ['cardNumber', 'expiryDate', 'cvv', 'cardName']
      return required.every(field => formData[field].trim())
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateShippingForm() || !validatePaymentForm()) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create order object
      const orderData = {
        id: `ORD-${Date.now()}`,
        items: cart,
        summary,
        shipping: formData,
        paymentMethod: formData.paymentMethod,
        orderDate: new Date().toISOString(),
        status: 'confirmed'
      }

      // Store order for confirmation page
      localStorage.setItem('completedOrder', JSON.stringify(orderData))
      
      // Clear cart
      clearCart()
      
      // Navigate to confirmation
      navigate('/order-confirmation')
    } catch (error) {
      alert('Payment failed. Please try again.')
    } finally {
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

              {/* Payment Method */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Method
                </h2>
                
                <div className="space-y-4 mb-6">
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <CreditCard className="w-6 h-6 mr-3 text-gray-600" />
                    <span className="font-medium">Credit/Debit Card</span>
                  </label>
                </div>

                {formData.paymentMethod === 'card' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="form-label">Card Number</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleCardNumberChange}
                        className="form-input"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Expiry Date</label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleExpiryChange}
                        className="form-input"
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">CVV</label>
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="123"
                        maxLength={4}
                        required
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="form-label">Name on Card</label>
                      <input
                        type="text"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>
                )}
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
                    Complete Order - {formatPrice(summary.total)}
                  </>
                )}
              </button>
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
                      src={item.image_url || item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatPrice(summary.subtotal)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>
                    {summary.shipping === 0 ? (
                      <span className="text-green-600 font-medium">Free</span>
                    ) : (
                      formatPrice(summary.shipping)
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (15%)</span>
                  <span>{formatPrice(summary.tax)}</span>
                </div>
                
                <div className="flex justify-between text-xl font-bold border-t border-gray-200 pt-3">
                  <span>Total</span>
                  <span>{formatPrice(summary.total)}</span>
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