import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle, Truck, Mail, Download } from 'lucide-react'

const OrderConfirmation = () => {
  const navigate = useNavigate()
  const [orderData, setOrderData] = useState(null)

  useEffect(() => {
    // Get order data from localStorage
    const storedOrder = localStorage.getItem('completedOrder')
    
    if (!storedOrder) {
      // If no order data, redirect to home
      navigate('/')
      return
    }

    try {
      const order = JSON.parse(storedOrder)
      setOrderData(order)
      // Clear the order data after displaying
      localStorage.removeItem('completedOrder')
    } catch (error) {
      console.error('Error parsing order data:', error)
      navigate('/')
    }
  }, [navigate])

  const formatPrice = (price) => {
    return `R${parseFloat(price).toLocaleString('en-ZA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!orderData) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Order Confirmed!
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              Thank you for your purchase. Your order has been successfully processed.
            </p>
            <p className="text-sm text-gray-500">
              Order #{orderData.id} • Placed on {formatDate(orderData.orderDate)}
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Order Details
                </h2>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  Confirmed
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="px-6 py-4">
              <h3 className="font-semibold text-gray-900 mb-4">Items Ordered</h3>
              <div className="space-y-4">
                {orderData.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <img
                      src={item.image_url || item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/64x64/6c757d/ffffff?text=${encodeURIComponent(item.name.charAt(0))}`
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      {item.brand && (
                        <p className="text-sm text-blue-600">{item.brand}</p>
                      )}
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatPrice(orderData.summary.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span>
                    {orderData.summary.shipping === 0 ? (
                      <span className="text-green-600 font-medium">Free</span>
                    ) : (
                      formatPrice(orderData.summary.shipping)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (15%)</span>
                  <span>{formatPrice(orderData.summary.tax)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(orderData.summary.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Truck className="w-5 h-5 mr-2" />
              Shipping Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Delivery Address</h3>
                <p className="text-gray-600">
                  {orderData.shipping.fullName}<br />
                  {orderData.shipping.address}<br />
                  {orderData.shipping.city}, {orderData.shipping.postalCode}<br />
                  {orderData.shipping.country}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Contact Details</h3>
                <p className="text-gray-600">
                  Email: {orderData.shipping.email}<br />
                  Phone: {orderData.shipping.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              What's Next?
            </h2>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <p>You'll receive an order confirmation email shortly with all the details.</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <p>We'll send you tracking information once your order ships (typically within 1-2 business days).</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <p>Your order will be delivered within 3-7 business days to the address provided.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="btn btn-primary inline-flex items-center justify-center"
            >
              Continue Shopping
            </Link>
            <button
              onClick={() => window.print()}
              className="btn btn-secondary inline-flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Print Receipt
            </button>
          </div>

          {/* Support */}
          <div className="text-center mt-12 p-6 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-gray-600 text-sm mb-4">
              If you have any questions about your order, our customer support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@bazara.com"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                support@bazara.com
              </a>
              <span className="hidden sm:inline text-gray-400">•</span>
              <a
                href="tel:+27123456789"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                +27 12 345 6789
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderConfirmation