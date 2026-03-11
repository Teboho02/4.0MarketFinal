import { useState, useEffect, useCallback } from 'react'
import { ShoppingCart, Package, ChevronDown, ChevronUp, RefreshCw, Search } from 'lucide-react'

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

const STATUS_STYLES = {
  pending:    'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped:    'bg-purple-100 text-purple-800',
  delivered:  'bg-green-100 text-green-800',
  cancelled:  'bg-red-100 text-red-800',
}

const PAYMENT_STYLES = {
  pending:  'bg-yellow-100 text-yellow-700',
  paid:     'bg-green-100 text-green-700',
  failed:   'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
}

const formatPrice = (price) => {
  const n = parseFloat(price)
  if (isNaN(n)) return 'R0.00'
  return `R${n.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const formatDate = (dateString) => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-ZA', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

const OrderList = ({ onBackToProducts }) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [orderItems, setOrderItems] = useState({}) // { [orderId]: items[] }
  const [loadingItems, setLoadingItems] = useState(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [search, setSearch] = useState('')

  // Pagination
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pages: 1 })

  const token = sessionStorage.getItem('token') || localStorage.getItem('token') || ''

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page, limit: 50 })
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (paymentFilter !== 'all') params.set('payment_status', paymentFilter)
      if (search.trim()) params.set('search', search.trim())

      const res = await fetch(`/api/orders/admin/all?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to fetch orders')
      setOrders(data.orders)
      setPagination(data.pagination)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, paymentFilter, search, token])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      const res = await fetch(`/api/orders/admin/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to update status')
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const toggleExpand = async (orderId) => {
    if (expandedId === orderId) {
      setExpandedId(null)
      return
    }
    setExpandedId(orderId)
    if (orderItems[orderId]) return // already loaded

    setLoadingItems(orderId)
    try {
      const res = await fetch(`/api/orders/admin/${orderId}/items`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) setOrderItems(prev => ({ ...prev, [orderId]: data.items }))
    } catch {}
    finally { setLoadingItems(null) }
  }

  // Stats derived from current page
  const stats = {
    total: pagination.total,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    revenue: orders.reduce((s, o) => s + (parseFloat(o.total) || 0), 0)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
        <div className="flex gap-2">
          <button onClick={fetchOrders} className="btn btn-secondary flex items-center gap-1 text-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={onBackToProducts} className="btn btn-secondary flex items-center gap-1 text-sm">
            <Package className="w-4 h-4" /> Products
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total Orders', value: stats.total, color: 'text-gray-900' },
          { label: 'Pending', value: stats.pending, color: 'text-yellow-600' },
          { label: 'Processing', value: stats.processing, color: 'text-blue-600' },
          { label: 'Shipped', value: stats.shipped, color: 'text-purple-600' },
          { label: 'Page Revenue', value: formatPrice(stats.revenue), color: 'text-green-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-xs text-gray-500 mb-1">{s.label}</div>
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm mb-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[180px]">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search order # or address..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="form-input text-sm flex-1"
          />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="form-select text-sm">
          <option value="all">All Statuses</option>
          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select value={paymentFilter} onChange={e => { setPaymentFilter(e.target.value); setPage(1) }} className="form-select text-sm">
          <option value="all">All Payments</option>
          {['pending', 'paid', 'failed', 'refunded'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <span className="text-sm text-gray-500 ml-auto">{pagination.total} orders</span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3" />
            <span className="text-gray-500">Loading orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Order', 'Customer', 'Items', 'Total', 'Payment', 'Order Status', 'Date', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map(order => (
                  <>
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      {/* Order # */}
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono font-medium text-gray-900">
                          {order.order_number}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">
                          {order.shipping_address?.fullName || '—'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.shipping_address?.email || '—'}
                        </div>
                      </td>

                      {/* Item count */}
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {order.item_count ?? '—'}
                      </td>

                      {/* Total */}
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                        {formatPrice(order.total)}
                      </td>

                      {/* Payment status */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_STYLES[order.payment_status] || 'bg-gray-100 text-gray-600'}`}>
                          {order.payment_status || 'unknown'}
                        </span>
                      </td>

                      {/* Order status dropdown */}
                      <td className="px-4 py-3">
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={e => handleStatusUpdate(order.id, e.target.value)}
                          className={`text-xs font-medium rounded-full px-2 py-1 border-0 outline-none cursor-pointer
                            ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600'}
                            ${updatingId === order.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {ORDER_STATUSES.map(s => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(order.created_at)}
                      </td>

                      {/* Expand */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleExpand(order.id)}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="View order items"
                        >
                          {expandedId === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded row — order items */}
                    {expandedId === order.id && (
                      <tr key={`${order.id}-expanded`}>
                        <td colSpan={8} className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                          {loadingItems === order.id ? (
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                              Loading items...
                            </div>
                          ) : (
                            <div>
                              <div className="text-xs font-semibold text-gray-500 uppercase mb-3">Order Items</div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {(orderItems[order.id] || []).map(item => (
                                  <div key={item.id} className="flex justify-between items-center bg-white rounded-lg px-3 py-2 text-sm border border-gray-100">
                                    <div>
                                      <span className="font-medium text-gray-900">{item.product_name}</span>
                                      <span className="text-gray-400 text-xs ml-2">× {item.quantity}</span>
                                      {item.product_sku && item.product_sku !== 'N/A' && (
                                        <span className="text-gray-400 text-xs ml-2">SKU: {item.product_sku}</span>
                                      )}
                                    </div>
                                    <span className="font-semibold text-gray-900 ml-4 whitespace-nowrap">
                                      {formatPrice(item.subtotal)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              {/* Shipping address */}
                              {order.shipping_address?.address && (
                                <div className="mt-3 text-xs text-gray-500">
                                  <span className="font-medium">Ship to:</span>{' '}
                                  {[
                                    order.shipping_address.address,
                                    order.shipping_address.city,
                                    order.shipping_address.postalCode,
                                    order.shipping_address.country
                                  ].filter(Boolean).join(', ')}
                                  {order.shipping_address.phone && ` · ${order.shipping_address.phone}`}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="btn btn-secondary btn-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {page} of {pagination.pages}</span>
          <button
            disabled={page === pagination.pages}
            onClick={() => setPage(p => p + 1)}
            className="btn btn-secondary btn-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default OrderList
