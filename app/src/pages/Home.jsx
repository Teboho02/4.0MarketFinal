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

      console.log('Raw products data:', allProducts)
      
      // Enhanced product processing with image validation
      const processedProducts = allProducts.map(product => {
        // Fix price data to prevent "RNan" display
        const retailPrice = parseFloat(product.retail_price) || 0;
        const costPrice = parseFloat(product.cost_price) || 0;
        
        // Calculate profit if not provided
        let profit = product.profit;
        if (!profit || typeof profit.amount === 'undefined') {
          const profitAmount = retailPrice - costPrice;
          const profitPercentage = costPrice > 0 ? (profitAmount / costPrice) * 100 : 0;
          profit = {
            amount: Math.max(0, profitAmount),
            percentage: `${profitPercentage.toFixed(1)}%`
          };
        }

        // Enhanced image handling
        let images = [];
        if (Array.isArray(product.images)) {
          images = product.images.map(img => {
            if (typeof img === 'string') {
              // Clean up image URLs - remove any extra characters or fix encoding
              let cleanUrl = img.trim();
              // Fix common URL issues
              cleanUrl = cleanUrl.replace(/\s+/g, '');
              // Ensure URL is properly encoded
              try {
                const url = new URL(cleanUrl);
                return url.toString();
              } catch (e) {
                console.warn('Invalid image URL:', cleanUrl);
                return null;
              }
            }
            return null;
          }).filter(img => img !== null); // Remove null values
        }

        // If no valid images, use a placeholder
        if (images.length === 0) {
          images = ['/api/placeholder/300/300'];
        }

        // Fix brand-category inconsistencies
        let categoryName = product.category_name;
        if (categoryName === 'iphones' && product.brand === 'SAMSUNG') {
          categoryName = 'samsung-phones';
        }

        return {
          ...product,
          retail_price: retailPrice.toFixed(2),
          cost_price: costPrice.toFixed(2),
          profit,
          images,
          category_name: categoryName,
          name: product.name || 'Unnamed Product',
          description: product.description || 'No description available',
          brand: product.brand || 'Unknown Brand'
        };
      });

      console.log('Processed products with images:', processedProducts);
      
      // Category grouping
      const groupedProducts = processedProducts.reduce((acc, product) => {
        let category = 'uncategorized';
        
        if (product.category_name && typeof product.category_name === 'string') {
          category = product.category_name.toLowerCase().trim();
        }
        
        category = category.replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        
        if (!category) {
          category = 'uncategorized';
        }
        
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(product);
        return acc;
      }, {});

      console.log('Final grouped products:', groupedProducts);
      setProducts(groupedProducts);
    } catch (err) {
      setError(err.message || 'Failed to load products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }

  const categoryDisplayNames = {
    iphones: 'iPhones',
    smartphones: 'Smartphones',
    laptops: 'Laptops',
    gaming: 'Gaming',
    accessories: 'Accessories',
    'samsung-phones': 'Samsung Phones',
    uncategorized: 'Other Products'
  }

  const getCategoryDisplayName = (category) => {
    return categoryDisplayNames[category] || 
           category.split('_').map(word => 
             word.charAt(0).toUpperCase() + word.slice(1)
           ).join(' ');
  }

  if (loading) {
    return (
      <div style={{ paddingTop: '112px' }} className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ paddingTop: '112px' }} className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={fetchProducts}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: '112px' }}>
      {/* Hero Slider */}
      <section className="relative overflow-hidden mx-3 mb-6 mt-4 rounded-2xl" style={{ height: '220px' }}>
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
                <h2 className="text-2xl md:text-4xl font-bold mb-3">
                  {slide.title}
                </h2>
                <p className="text-sm md:text-lg mb-4 opacity-90">
                  {slide.description}
                </p>
                <button className="bg-white text-gray-900 px-6 py-2 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors">
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
      <div className="pb-8">
        {/* Product Categories */}
        {Object.entries(products).map(([category, categoryProducts]) => {
          if (categoryProducts.length === 0) return null;

          return (
            <section key={category} className="mb-6">
              {/* Section Header */}
              <div className="flex justify-between items-center px-4 mb-3">
                <h2 className="text-base font-bold text-gray-900">
                  {getCategoryDisplayName(category)}
                </h2>
                <Link
                  to={`/category/${category}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  View All
                </Link>
              </div>

              {/* Horizontal Scroll Row */}
              <div
                style={{
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'none',
                  paddingLeft: '1rem',
                  paddingRight: '1rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    width: 'max-content',
                    paddingBottom: '0.25rem',
                  }}
                >
                  {categoryProducts.slice(0, 8).map((product) => (
                    <div key={product.id} style={{ width: '160px', flexShrink: 0 }}>
                      <ProductCard product={product} compact />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })}

        {Object.keys(products).length === 0 && !loading && (
          <div className="text-center py-16 px-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              No Products Available
            </h3>
            <p className="text-gray-600 text-sm">
              We're working on stocking our inventory. Please check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;