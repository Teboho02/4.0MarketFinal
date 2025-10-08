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

  // Test image URLs directly in the component
  const testImageUrls = [
    'https://bucket-uf4nv2.s3.ap-southeast-1.amazonaws.com/products/cf6229d7-fff5-42a5-af13-81b76c09e694/09b53dba-f4c3-41fb-8835-a400fefc71e9.jpeg',
    'https://bucket-uf4nv2.s3.ap-southeast-1.amazonaws.com/products/cf6229d7-fff5-42a5-af13-81b76c09e694/21915175-c5bd-434a-9593-4a48c88bc4b2.jpg'
  ];

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
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

        {/* Image Debug Section */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold mb-2 text-yellow-800">Image Debug:</h3>
            <p className="text-yellow-700 mb-2">Test Image URLs:</p>
            <div className="flex space-x-4 mb-4">
              {testImageUrls.map((url, index) => (
                <div key={index} className="text-center">
                  <img 
                    src={url} 
                    alt={`Test ${index}`}
                    className="w-20 h-20 object-cover rounded border"
                    onError={(e) => {
                      console.error(`Failed to load test image ${index}:`, url);
                      e.target.style.display = 'none';
                    }}
                    onLoad={(e) => {
                      console.log(`Successfully loaded test image ${index}:`, url);
                    }}
                  />
                  <p className="text-xs mt-1 text-yellow-600">Test {index + 1}</p>
                </div>
              ))}
            </div>
            <p className="text-yellow-700">Categories found: {Object.keys(products).join(', ') || 'None'}</p>
            <p className="text-yellow-700">Total products: {Object.values(products).flat().length}</p>
          </div>
        )}

        {/* Product Categories */}
        {Object.entries(products).map(([category, categoryProducts]) => {
          if (categoryProducts.length === 0) return null;
          
          return (
            <section key={category} className="mb-16">
              <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900">
                  {getCategoryDisplayName(category)}
                </h2>
                <Link
                  to={`/category/${category}`}
                  className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                >
                  View All {getCategoryDisplayName(category)}
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categoryProducts.slice(0, 4).map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product}
                  />
                ))}
              </div>
            </section>
          );
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
  );
};

export default Home;