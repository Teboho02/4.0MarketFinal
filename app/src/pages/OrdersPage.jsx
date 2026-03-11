import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Package, ChevronRight, Loader, Clock, CheckCircle, Truck, XCircle, RefreshCw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const OrdersPage = () => {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedOrder, setSelectedOrder] = useState(null)

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login')
            return
        }
        fetchOrders()
    }, [isAuthenticated, navigate])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const token = sessionStorage.getItem('token') || localStorage.getItem('token')

            const response = await fetch('/api/orders/me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch orders')
            }

            setOrders(data.orders || [])
        } catch (err) {
            console.error('Error fetching orders:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const formatPrice = (price) => {
        const numericPrice = parseFloat(price)
        if (isNaN(numericPrice)) return 'R0.00'
        return `R${numericPrice.toLocaleString('en-ZA', {
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

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-5 h-5 text-yellow-500" />
            case 'processing':
                return <RefreshCw className="w-5 h-5 text-blue-500" />
            case 'shipped':
                return <Truck className="w-5 h-5 text-purple-500" />
            case 'delivered':
                return <CheckCircle className="w-5 h-5 text-green-500" />
            case 'cancelled':
            case 'refunded':
                return <XCircle className="w-5 h-5 text-red-500" />
            default:
                return <Package className="w-5 h-5 text-gray-500" />
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'processing':
                return 'bg-blue-100 text-blue-800'
            case 'shipped':
                return 'bg-purple-100 text-purple-800'
            case 'delivered':
                return 'bg-green-100 text-green-800'
            case 'cancelled':
            case 'refunded':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'failed':
                return 'bg-red-100 text-red-800'
            case 'refunded':
                return 'bg-purple-100 text-purple-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    if (loading) {
        return (
            <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading your orders...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="pt-16 min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Package className="w-8 h-8 mr-3 text-blue-600" />
                        My Orders
                    </h1>
                    <p className="text-gray-600 mt-2">Track and manage your orders</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800">{error}</p>
                        <button
                            onClick={fetchOrders}
                            className="mt-2 text-red-600 hover:text-red-800 font-medium"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
                        <p className="text-gray-600 mb-6">When you make a purchase, your orders will appear here.</p>
                        <Link to="/" className="btn btn-primary">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                            >
                                {/* Order Header */}
                                <div
                                    className="p-6 cursor-pointer"
                                    onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            {getStatusIcon(order.status)}
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    Order #{order.order_number}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {formatDate(order.created_at)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">{formatPrice(order.total)}</p>
                                                <div className="flex space-x-2 mt-1">
                                                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${getPaymentStatusColor(order.payment_status)}`}>
                                                        {order.payment_status}
                                                    </span>
                                                </div>
                                            </div>
                                            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${selectedOrder === order.id ? 'rotate-90' : ''}`} />
                                        </div>
                                    </div>
                                </div>

                                {/* Order Details (Expanded) */}
                                {selectedOrder === order.id && (
                                    <div className="border-t border-gray-200 p-6 bg-gray-50">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {/* Order Info */}
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-3">Order Details</h4>
                                                <dl className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <dt className="text-gray-600">Subtotal:</dt>
                                                        <dd className="font-medium">{formatPrice(order.subtotal)}</dd>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <dt className="text-gray-600">Shipping:</dt>
                                                        <dd className="font-medium">{formatPrice(order.shipping_cost)}</dd>
                                                    </div>
                                                    {parseFloat(order.tax) > 0 && (
                                                        <div className="flex justify-between">
                                                            <dt className="text-gray-600">Tax:</dt>
                                                            <dd className="font-medium">{formatPrice(order.tax)}</dd>
                                                        </div>
                                                    )}
                                                    {parseFloat(order.discount) > 0 && (
                                                        <div className="flex justify-between">
                                                            <dt className="text-gray-600">Discount:</dt>
                                                            <dd className="font-medium text-green-600">-{formatPrice(order.discount)}</dd>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between border-t pt-2">
                                                        <dt className="font-semibold">Total:</dt>
                                                        <dd className="font-bold">{formatPrice(order.total)}</dd>
                                                    </div>
                                                </dl>
                                            </div>

                                            {/* Shipping Address */}
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-3">Shipping Address</h4>
                                                {order.shipping_address && (
                                                    <div className="text-sm text-gray-600">
                                                        <p className="font-medium text-gray-900">{order.shipping_address.fullName}</p>
                                                        <p>{order.shipping_address.address}</p>
                                                        <p>{order.shipping_address.city}, {order.shipping_address.postalCode}</p>
                                                        <p>{order.shipping_address.country}</p>
                                                        {order.shipping_address.phone && (
                                                            <p className="mt-2">Phone: {order.shipping_address.phone}</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Order Timeline */}
                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <h4 className="font-semibold text-gray-900 mb-4">Order Status</h4>
                                            <div className="flex items-center space-x-4">
                                                {['pending', 'processing', 'shipped', 'delivered'].map((step, index) => {
                                                    const isCompleted = ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status) >= index
                                                    const isCurrent = order.status === step

                                                    return (
                                                        <div key={step} className="flex items-center">
                                                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${isCompleted ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                                                                } ${isCurrent ? 'ring-2 ring-blue-300' : ''}`}>
                                                                {isCompleted ? <CheckCircle className="w-4 h-4" /> : index + 1}
                                                            </div>
                                                            <span className={`ml-2 text-sm capitalize ${isCompleted ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                                                {step}
                                                            </span>
                                                            {index < 3 && (
                                                                <div className={`ml-4 w-12 h-0.5 ${isCompleted && order.status !== step ? 'bg-blue-600' : 'bg-gray-200'}`} />
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default OrdersPage
