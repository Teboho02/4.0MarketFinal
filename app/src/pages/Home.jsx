import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { productService } from '../services/productService'

const Home = () => {
  const [products, setProducts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Slider data
  const slides = [
    {
      id: 1,
      title: 'Latest Tech',
      description: 'Discover cutting-edge technology that transforms your digital experience',
      buttonText: 'Shop Now',
      bgColor: 'from-blue-600 to-blue-800'
    },
    {
      id: 2,
      title: 'Gaming Gear',
      description: 'Level up your gaming with premium consoles, PCs, and accessories',
      buttonText: 'Explore Gaming',
      bgColor: 'from-purple-600 to-purple-800'
    },
    {
      id: 3,
      title: 'Best Deals',
      description: 'Unbeatable prices on top brands and latest releases',
      buttonText: 'Save Now',
      bgColor: 'from-green-600 to-green-800'
    }
  ]

  useEffect(() => {
    fetchProducts()
    
    // Auto-rotate slides
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const allProducts = await productService.getAllProducts()
      
      // Group products by category
      const groupedProducts = allProducts.reduce((acc, product) => {
        const category = product.category.toLowerCase()
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push(product)
        return acc
      }, {})

      setProducts(groupedProducts)
    } catch (err) {
      setError(err.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const categoryDisplayNames = {
    laptops: 'Laptops',
    smartphones: 'Smartphones',
    gaming: 'Gaming',
    accessories: 'Accessories'
  }

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16">
      {/* Hero Slider */}
      <section className="relative h-96 overflow-hidden rounded-xl mx-4 mb-8 mt-6">
        <div 
          className="flex h-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`min-w-full h-full bg-gradient-to-r ${slide.bgColor} flex items-center justify-center text-white text-center px-8`}
            >
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  {slide.title}
                </h2>
                <p className="text-lg md:text-xl mb-6 opacity-90">
                  {slide.description}
                </p>
                <button className="bg-white text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                  {slide.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-20 hover:bg-opacity-40 text-white p-2 rounded-full transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-20 hover:bg-opacity-40 text-white p-2 rounded-full transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
        
        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Explore Our Tech Collection
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the latest and greatest in technology across multiple categories. 
            Find your perfect device today.
          </p>
        </div>

        {error && (
          <div className="alert alert-error text-center mb-8">
            Failed to load products: {error}
          </div>
        )}

        {/* Product Categories */}
        {Object.entries(products).map(([category, categoryProducts]) => {
          if (categoryProducts.length === 0) return null
          
          return (
            <section key={category} className="mb-16">
              <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900">
                  {categoryDisplayNames[category] || category}
                </h2>
                <Link
                  to={`/category/${category}`}
                  className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                >
                  View All {categoryDisplayNames[category]}
                </Link>
              </div>
              
              <div className="grid grid-auto gap-6">
                {categoryProducts.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )
        })}

        {Object.keys(products).length === 0 && !loading && (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              No Products Available
            </h3>
            <p className="text-gray-600">
              We're working on stocking our inventory. Please check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home