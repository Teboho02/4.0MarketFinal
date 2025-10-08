import { useState } from 'react'
import { ShoppingCart, Package, Filter } from 'lucide-react'
import PriceFormatter from '../common/PriceFormatter'

const OrderList = ({ orders, onBackToProducts }) => {
  const [localOrders, setLocalOrders] = useState(orders)
  const [filter, setFilter] = useState('all') // all, fulfilled, unfulfilled
  const [sortBy, setSortBy] = useState('date') // date, price, name

  const toggleFulfillment = (orderId) => {
    setLocalOrders(localOrders.map(order => 
      order.id === orderId 
        ? { ...order, fulfilled: !order.fulfilled }
        : order
    ))
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFulfillmentBadge = (fulfilled) => {
    return fulfilled ? 'badge-green' : 'badge-yellow'
  }

  const getFulfillmentText = (fulfilled) => {
    return fulfilled ? 'Fulfilled' : 'Pending'
  }

  const filteredOrders = localOrders.filter(order => {
    if (filter === 'all') return true
    if (filter === 'fulfilled') return order.fulfilled
    if (filter === 'unfulfilled') return !order.fulfilled
    return true
  })

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.orderDate) - new Date(a.orderDate)
      case 'price':
        return b.orderPrice - a.orderPrice
      case 'name':
        return a.productName.localeCompare(b.productName)
      default:
        return 0
    }
  })

  const stats = {
    total: localOrders.length,
    fulfilled: localOrders.filter(order => order.fulfilled).length,
    unfulfilled: localOrders.filter(order => !order.fulfilled).length,
    totalRevenue: localOrders.reduce((sum, order) => sum + order.orderPrice, 0)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
        <button onClick={onBackToProducts} className="btn btn-secondary flex items-center">
          <Package className="w-4 h-4 mr-2" />
          Back to Products
        </button>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-sm text-gray-600">Total Orders</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-sm text-gray-600">Fulfilled</div>
          <div className="text-2xl font-bold text-green-600">{stats.fulfilled}</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.unfulfilled}</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-sm text-gray-600">Total Revenue</div>
          <div className="text-2xl font-bold text-blue-600">
            R{stats.totalRevenue.toLocaleString('en-ZA')}
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="form-select text-sm"
            >
              <option value="all">All Orders</option>
              <option value="fulfilled">Fulfilled Only</option>
              <option value="unfulfilled">Unfulfilled Only</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-select text-sm"
            >
              <option value="date">Sort by Date</option>
              <option value="price">Sort by Price</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-500">
            Showing {sortedOrders.length} of {localOrders.length} orders
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900 product-code">
                        {order.orderNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(order.orderDate)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {order.clientEmail}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {order.productName}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {order.deliveryAddress}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      <PriceFormatter price={order.orderPrice} />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${getFulfillmentBadge(order.fulfilled)}`}>
                      {getFulfillmentText(order.fulfilled)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleFulfillment(order.id)}
                        className={`btn btn-sm ${
                          order.fulfilled ? 'btn-secondary' : 'btn-primary'
                        }`}
                      >
                        {order.fulfilled ? 'Mark Unfulfilled' : 'Mark Fulfilled'}
                      </button>
                      <button className="btn btn-sm btn-outline">
                        View Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedOrders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? "Orders will appear here when customers make purchases."
                : `No ${filter} orders found.`
              }
            </p>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {sortedOrders.length > 0 && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Select multiple orders to perform bulk actions
          </div>
          <div className="flex space-x-2">
            <button className="btn btn-secondary btn-sm">
              Export Orders
            </button>
            <button className="btn btn-primary btn-sm">
              Bulk Fulfill
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderList