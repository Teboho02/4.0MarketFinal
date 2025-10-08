import { Package, Plus, ShoppingCart, Edit3, Trash2, Image as ImageIcon } from 'lucide-react'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorMessage from '../common/ErrorMessage'

const ProductList = ({
  products,
  suppliers,
  loading,
  error,
  onDelete,
  onRefresh,
  selectedCategory,
  onAddProduct,
  onViewOrders
}) => {
  console.log('ProductList received:', { 
    products, 
    productsCount: products?.length,
    loading, 
    error,
    selectedCategory 
  })

  // Price formatter function
  const formatPrice = (price) => {
    if (price === null || price === undefined) {
      return 'R 0.00'
    }
    
    // Handle string prices like "100.00", "1500.00" etc.
    const numericPrice = typeof price === 'string' 
      ? parseFloat(price)
      : Number(price)
    
    if (isNaN(numericPrice)) {
      return 'R 0.00'
    }
    
    return `R ${numericPrice.toFixed(2)}`
  }

  const getPrimaryImage = (product) => {
    return product.images && product.images.length > 0 
      ? product.images[0] 
      : null
  }

  const hasMultipleImages = (product) => {
    return product.images && product.images.length > 1
  }

  const getStockStatus = (quantity, minStockLevel) => {
    if (quantity === 0) return { status: 'out-of-stock', label: 'Out of Stock', color: 'text-red-600', bgColor: 'bg-red-100' }
    if (quantity <= minStockLevel) return { status: 'low-stock', label: 'Low Stock', color: 'text-orange-600', bgColor: 'bg-orange-100' }
    return { status: 'in-stock', label: 'In Stock', color: 'text-green-600', bgColor: 'bg-green-100' }
  }

  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find(s => s.id === supplierId)
    return supplier ? supplier.name : 'Unknown Supplier'
  }

  if (loading) {
    return <LoadingSpinner message="Loading products..." />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={onRefresh} />
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
        <p className="mt-2 text-sm text-gray-500">
          Get started by creating your first product.
        </p>
        <div className="mt-6">
          <button
            onClick={onAddProduct}
            className="btn btn-primary flex items-center mx-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedCategory === 'all' 
              ? `All Products` 
              : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`
            }
          </h2>
          <p className="text-gray-600 mt-1">
            {products.length} product{products.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={onViewOrders} 
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center transition-colors"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            View Orders
          </button>
          <button 
            onClick={onAddProduct} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => {
          const primaryImage = getPrimaryImage(product)
          const stockStatus = getStockStatus(product.stock_quantity, product.min_stock_level)
          
          return (
            <div 
              key={product.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200"
            >
              {/* Product Image */}
              <div className="relative h-48 bg-gray-100">
                {primaryImage ? (
                  <img
                    src={primaryImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div 
                  className={`w-full h-full flex items-center justify-center ${primaryImage ? 'hidden' : 'flex'}`}
                >
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                </div>
                
                {/* Multiple Images Badge */}
                {hasMultipleImages(product) && (
                  <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                    +{product.images.length - 1}
                  </div>
                )}
                
                {/* Stock Status Badge */}
                <div className="absolute top-2 left-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color} ${stockStatus.bgColor}`}>
                    {stockStatus.label}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                {/* Name and Category */}
                <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Category:</span>
                  <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {product.category_name || 'Uncategorized'}
                  </span>
                </div>

                {/* Brand and SKU */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Brand:</span>
                  <span className="text-sm font-medium">{product.brand}</span>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">SKU:</span>
                  <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {product.sku}
                  </span>
                </div>

                {/* Stock Information */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">Stock:</span>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${stockStatus.color}`}>
                      {product.stock_quantity} units
                    </span>
                    <div className="text-xs text-gray-500">
                      Min: {product.min_stock_level} | Max: {product.max_stock_level}
                    </div>
                  </div>
                </div>

                {/* Supplier */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">Supplier:</span>
                  <span className="text-sm font-medium text-purple-600">
                    {product.supplier_name || getSupplierName(product.supplier_id)}
                  </span>
                </div>

                {/* Prices Section */}
                <div className="border-t border-gray-200 pt-3 mt-3">
                  {/* Retail Price */}
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Retail Price:</span>
                    <span className="font-semibold text-green-600 text-lg">
                      {formatPrice(product.retail_price)}
                    </span>
                  </div>
                  
                  {/* Wholesale Price */}
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Wholesale:</span>
                    <span className="text-sm text-gray-600">
                      {formatPrice(product.wholesale_price)}
                    </span>
                  </div>
                  
                  {/* Cost Price */}
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Cost:</span>
                    <span className="text-sm text-gray-500">
                      {formatPrice(product.cost_price)}
                    </span>
                  </div>
                  
                  {/* Profit */}
                  {product.profit && (
                    <div className="flex justify-between items-center bg-blue-50 p-2 rounded mt-2">
                      <span className="text-sm font-medium text-blue-800">Profit:</span>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-blue-600">
                          {formatPrice(product.profit.amount)}
                        </span>
                        <span className="text-xs text-blue-500 ml-1 block">
                          ({product.profit.percentage})
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 mt-4 pt-3 border-t border-gray-200">
                  <button 
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center text-sm transition-colors"
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button 
                    onClick={() => onDelete(product.id)}
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center justify-center text-sm transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer Stats */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            <p className="text-sm text-gray-600">Total Products</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {products.filter(p => p.stock_quantity > 0).length}
            </p>
            <p className="text-sm text-gray-600">In Stock</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">
              {products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= p.min_stock_level).length}
            </p>
            <p className="text-sm text-gray-600">Low Stock</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">
              {products.filter(p => p.stock_quantity === 0).length}
            </p>
            <p className="text-sm text-gray-600">Out of Stock</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductList