import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Package, Loader } from 'lucide-react'
import { useCart } from '../context/CartContext'

const PaymentSuccessPage = () => {
  const navigate = useNavigate()
  const { clearCart } = useCart()
  const [verifying, setVerifying] = useState(true)
  const [orderData, setOrderData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    verifyPayment()
  }, [])

  const verifyPayment = async () => {
    try {
      // Get checkout ID from session storage
      const checkoutId = sessionStorage.getItem('yocoCheckoutId')
      const pendingOrder = sessionStorage.getItem('pendingOrder')

      if (!checkoutId) {
        setError('No payment information found')
        setVerifying(false)
        return
      }

      // Verify payment status with backend
      const response = await fetch(`/api/payments/yoco/status/${checkoutId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify payment')
      }

      // Check if payment was successful
      if (data.success && data.checkout.status === 'complete') {
        // Parse pending order data
        const order = JSON.parse(pendingOrder)
        
        // Update order status
        order.status = 'confirmed'
        order.paymentId = checkoutId
        order.paymentMethod = 'yoco'
        
        // Store completed order
        localStorage.setItem('completedOrder', JSON.stringify(order))
        
        // Clear cart and session data
        clearCart()
        sessionStorage.removeItem('yocoCheckoutId')
        sessionStorage.removeItem('pendingOrder')
        
        setOrderData(order)
      } else {
        throw new Error('Payment was not completed successfully')
      }

    } catch (error) {
      console.error('Payment verification error:', error)
      setError(error.message || 'Failed to verify payment')
    } finally {
      setVerifying(false)
    }
  }

  const formatPrice = (price) => {
    return `R${parseFloat(price).toLocaleString('en-ZA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  }

  if (verifying) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Verifying Payment...
          </h2>
          <p className="text-gray-600">Please wait while we confirm your payment</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">✕</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Verification Failed
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/checkout')}
              className="btn btn-primary w-full"
            >
              Return to Checkout
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600 mb-6">
              Thank you for your order. We've received your payment and will process your order shortly.
            </p>
            
            {orderData && (
              <>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600 mb-1">Order Number</p>
                  <p className="text-lg font-bold text-gray-900">{orderData.id}</p>
                </div>

                <div className="text-left border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Order Details</h3>
                  
                  <div className="space-y-3 mb-6">
                    {orderData.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.image_url || item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>{formatPrice(orderData.summary.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span>{formatPrice(orderData.summary.shipping)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span>{formatPrice(orderData.summary.tax)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                      <span>Total</span>
                      <span>{formatPrice(orderData.summary.total)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mt-6 text-left">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    What's Next?
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>✓ Order confirmation sent to {orderData.shipping.email}</li>
                    <li>✓ We'll notify you when your order ships</li>
                    <li>✓ Track your order anytime in your account</li>
                  </ul>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/products')}
              className="btn btn-outline flex-1"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => navigate('/orders')}
              className="btn btn-primary flex-1 flex items-center justify-center"
            >
              <Package className="w-5 h-5 mr-2" />
              View Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccessPage