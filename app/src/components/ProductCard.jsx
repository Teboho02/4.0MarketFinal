import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Check } from 'lucide-react'
import { useCart } from '../context/CartContext'

const ProductCard = ({ product }) => {
  const { addToCart } = useCart()
  const [isAdded, setIsAdded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleAddToCart = (e) => {
    e.preventDefault() // Prevent navigation when clicking cart button
    e.stopPropagation() // Prevent event bubbling
    
    addToCart(product)
    setIsAdded(true)
    
    // Reset the button after 2 seconds
    setTimeout(() => {
      setIsAdded(false)
    }, 2000)
  }

  const formatPrice = (price) => {
    const priceValue = parseFloat(price)
    if (isNaN(priceValue)) return 'R0.00'
    
    return `R${priceValue.toLocaleString('en-ZA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  }

  // Get the first image from the images array or use placeholder
  const getProductImage = () => {
    if (imageError || !product.images || product.images.length === 0) {
      return `https://via.placeholder.com/300x200/6c757d/ffffff?text=${encodeURIComponent(product.name || 'Product')}`
    }
    return product.images[0]
  }

  // Get stock quantity - handle different possible field names
  const getStockQuantity = () => {
    return product.stock_quantity || product.stock || 0
  }

  // Get product specifications
 const getSpecifications = () => {
  const specs = product.specifications || product.specs || ''
  
  if (specs && typeof specs === 'object') {
    // Create a more readable format
    const parts = []
    if (specs.ram) parts.push(specs.ram)
    if (specs.storage) parts.push(specs.storage)
    if (specs.color) parts.push(specs.color)
    if (specs.processor) parts.push(specs.processor)
    return parts.join(' • ')
  }
  
  return specs
}

  // Get product price - handle different possible field names
  const getProductPrice = () => {
    return product.retail_price || product.price || '0.00'
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const stockQuantity = getStockQuantity()
  const productPrice = getProductPrice()
  const productImage = getProductImage()
  const specifications = getSpecifications()

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
      {/* Product Image and Info - Clickable for navigation */}
      <Link 
        to={`/product/${product.id}`}
        className="flex-grow block"
      >
        <div className="h-48 bg-gray-50 flex items-center justify-center p-4">
          <img
            src={productImage}
            alt={product.name}
            className="max-w-full max-h-full object-contain"
            onError={handleImageError}
          />
        </div>

        {/* Product Info */}
        <div className="p-4 flex-grow">
          <div className="mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors">
              {product.name || 'Unnamed Product'}
            </h3>
            {product.brand && (
              <p className="text-sm text-blue-600 font-medium">
                {product.brand}
              </p>
            )}
          </div>

          {/* Specifications */}
          {specifications && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {specifications}
            </p>
          )}

          {/* Description fallback */}
          {!specifications && product.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Price */}
          <div className="mb-4">
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(productPrice)}
            </span>
          </div>

        
        </div>
      </Link>

      {/* Add to Cart Button - Separate from navigation */}
      <div className="p-4 pt-0">
        <button
          onClick={handleAddToCart}
          disabled={isAdded || stockQuantity === 0}
          className={`w-full py-2 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
            isAdded
              ? 'bg-green-600 text-white'
              : stockQuantity === 0
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4" />
              <span>Added!</span>
            </>
          ) : stockQuantity === 0 ? (
            <span>Out of Stock</span>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default ProductCard