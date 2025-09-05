import { useState } from 'react'
import { ShoppingCart, Check } from 'lucide-react'
import { useCart } from '../context/CartContext'

const ProductCard = ({ product }) => {
  const { addToCart } = useCart()
  const [isAdded, setIsAdded] = useState(false)

  const handleAddToCart = () => {
    addToCart(product)
    setIsAdded(true)
    
    // Reset the button after 2 seconds
    setTimeout(() => {
      setIsAdded(false)
    }, 2000)
  }

  const formatPrice = (price) => {
    return `R${parseFloat(price).toLocaleString('en-ZA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Product Image */}
      <div className="h-48 bg-gray-50 flex items-center justify-center p-4">
        <img
          src={product.image_url}
          alt={product.name}
          className="max-w-full max-h-full object-contain"
          onError={(e) => {
            e.target.src = `https://via.placeholder.com/300x200/6c757d/ffffff?text=${encodeURIComponent(product.name || 'Product')}`
          }}
        />
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {product.name}
          </h3>
          {product.brand && (
            <p className="text-sm text-blue-600 font-medium">
              {product.brand}
            </p>
          )}
        </div>

        {/* Specifications */}
        {product.specs && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.specs}
          </p>
        )}

        {/* Price */}
        <div className="mb-4">
          <span className="text-xl font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className={`w-full py-2 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
            isAdded
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md'
          }`}
          disabled={isAdded}
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4" />
              <span>Added!</span>
            </>
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

export default ProductCard;