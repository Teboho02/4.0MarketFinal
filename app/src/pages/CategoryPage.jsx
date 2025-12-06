import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Search, Filter, Grid, List, ChevronDown } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { productService } from '../services/productService'

const CategoryPage = () => {
  const { categoryName } = useParams()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [filters, setFilters] = useState({
    priceRange: 'all',
    brand: 'all',
    sortBy: 'name',
    minPrice: '',
    maxPrice: ''
  })

  // Category configuration with hero sections and descriptions
  const categoryConfig = {
    laptops: {
      title: 'Laptops',
      description: 'Discover powerful and sleek laptops designed for work, creativity, and entertainment. From ultrabooks to gaming beasts.',
      hero: 'from-blue-600 to-blue-800',
      priceRanges: [
        { value: 'under-10000', label: 'Under R10,000' },
        { value: '10000-20000', label: 'R10,000 - R20,000' },
        { value: '20000-40000', label: 'R20,000 - R40,000' },
        { value: 'over-40000', label: 'Over R40,000' }
      ]
    },
    smartphones: {
      title: 'Smartphones',
      description: 'Discover the latest mobile technology that keeps you connected, productive, and entertained on the go.',
      hero: 'from-purple-600 to-purple-800',
      priceRanges: [
        { value: 'under-5000', label: 'Under R5,000' },
        { value: '5000-10000', label: 'R5,000 - R10,000' },
        { value: '10000-20000', label: 'R10,000 - R20,000' },
        { value: 'over-20000', label: 'Over R20,000' }
      ]
    },
    PC: {
      title: 'PCs and Monitors',
      description: 'Elevate your gaming experience with cutting-edge consoles, powerful gaming PCs, and immersive accessories.',
      hero: 'from-red-600 to-red-800',
      priceRanges: [
        { value: 'under-5000', label: 'Under R5,000' },
        { value: '5000-15000', label: 'R5,000 - R15,000' },
        { value: '15000-30000', label: 'R15,000 - R30,000' },
        { value: 'over-30000', label: 'Over R30,000' }
      ]
    },
    accessories: {
      title: 'Accessories',
      description: 'Complete your tech setup with premium accessories and peripherals that enhance your digital experience.',
      hero: 'from-green-600 to-green-800',
      priceRanges: [
        { value: 'under-500', label: 'Under R500' },
        { value: '500-1000', label: 'R500 - R1,000' },
        { value: '1000-3000', label: 'R1,000 - R3,000' },
        { value: 'over-3000', label: 'Over R3,000' }
      ]
    }
  }

  const currentCategory = categoryConfig[categoryName] || {
    title: categoryName?.charAt(0).toUpperCase() + categoryName?.slice(1) || 'Products',
    description: `Explore our ${categoryName} collection`,
    hero: 'from-gray-600 to-gray-800',
    priceRanges: [
      { value: 'under-5000', label: 'Under R5,000' },
      { value: '5000-15000', label: 'R5,000 - R15,000' },
      { value: '15000-30000', label: 'R15,000 - R30,000' },
      { value: 'over-30000', label: 'Over R30,000' }
    ]
  }

  useEffect(() => {
    fetchProducts()
  }, [categoryName])

  useEffect(() => {
    applyFilters()
  }, [products, filters, searchTerm])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await productService.getProductsByCategory(categoryName)
      setProducts(data)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load products')
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...products]

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(search) ||
        product.brand?.toLowerCase().includes(search) ||
        product.specs?.toLowerCase().includes(search) ||
        product.description?.toLowerCase().includes(search)
      )
    }

    // Price range filter
    if (filters.priceRange !== 'all') {
      const ranges = {
        'under-500': [0, 500],
        'under-5000': [0, 5000],
        'under-10000': [0, 10000],
        '500-1000': [500, 1000],
        '1000-3000': [1000, 3000],
        '5000-10000': [5000, 10000],
        '5000-15000': [5000, 15000],
        '10000-20000': [10000, 20000],
        '15000-30000': [15000, 30000],
        '20000-40000': [20000, 40000],
        'over-3000': [3000, Infinity],
        'over-20000': [20000, Infinity],
        'over-30000': [30000, Infinity],
        'over-40000': [40000, Infinity]
      }
      
      const [min, max] = ranges[filters.priceRange] || [0, Infinity]
      filtered = filtered.filter(product => 
        product.price >= min && product.price < max
      )
    }

    // Custom price range filter
    if (filters.minPrice || filters.maxPrice) {
      const minPrice = parseFloat(filters.minPrice) || 0
      const maxPrice = parseFloat(filters.maxPrice) || Infinity
      filtered = filtered.filter(product => 
        product.price >= minPrice && product.price <= maxPrice
      )
    }

    // Brand filter
    if (filters.brand !== 'all') {
      filtered = filtered.filter(product => 
        product.brand && product.brand.toLowerCase() === filters.brand.toLowerCase()
      )
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'name-az':
          return a.name.localeCompare(b.name)
        case 'name-za':
          return b.name.localeCompare(a.name)
        case 'newest':
          return new Date(b.created_at || 0) - new Date(a.created_at || 0)
        case 'brand':
          return (a.brand || '').localeCompare(b.brand || '')
        default:
          return a.name.localeCompare(b.name)
      }
    })

    setFilteredProducts(filtered)
  }

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      priceRange: 'all',
      brand: 'all',
      sortBy: 'name',
      minPrice: '',
      maxPrice: ''
    })
    setSearchTerm('')
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  // Get unique brands from products
  const availableBrands = [...new Set(
    products
      .filter(product => product.brand)
      .map(product => product.brand)
      .sort()
  )]

  const formatPrice = (price) => {
    return `R${parseFloat(price).toLocaleString('en-ZA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  }

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600">Loading {categoryName} products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className={`bg-gradient-to-r ${currentCategory.hero} text-white py-20 px-4 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="text-6xl mb-4">{currentCategory.icon}</div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {currentCategory.title}
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
            {currentCategory.description}
          </p>
          <div className="mt-8 text-sm opacity-75">
            {products.length > 0 && (
              <span>{products.length} products available</span>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="alert alert-error mb-8">
            <div className="flex items-center justify-between">
              <span>Failed to load products: {error}</span>
              <button
                onClick={fetchProducts}
                className="btn btn-sm bg-red-100 text-red-800 hover:bg-red-200"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Search and View Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${currentCategory.title.toLowerCase()}...`}
              value={searchTerm}
              onChange={handleSearch}
              className="form-input pl-10 w-full"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
              title="Grid view"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
              title="List view"
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="form-select"
                >
                  <option value="name">Name A-Z</option>
                  <option value="name-za">Name Z-A</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="brand">Brand</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                  className="form-select"
                >
                  <option value="all">All Prices</option>
                  {currentCategory.priceRanges.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Price (R)
                </label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="form-input"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price (R)
                </label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="form-input"
                  placeholder="No limit"
                  min="0"
                />
              </div>

              {/* Brand Filter */}
              {availableBrands.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand
                  </label>
                  <select
                    value={filters.brand}
                    onChange={(e) => handleFilterChange('brand', e.target.value)}
                    className="form-select"
                  >
                    <option value="all">All Brands</option>
                    {availableBrands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{filteredProducts.length}</span> of{' '}
                <span className="font-semibold">{products.length}</span> products
                {searchTerm && (
                  <span> for "<span className="font-semibold">{searchTerm}</span>"</span>
                )}
              </div>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}

        {/* Results Summary */}
        {!showFilters && (
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredProducts.length}</span> of{' '}
              <span className="font-semibold">{products.length}</span> products
              {searchTerm && (
                <span> for "<span className="font-semibold">{searchTerm}</span>"</span>
              )}
            </div>
            {(searchTerm || filters.priceRange !== 'all' || filters.brand !== 'all' || filters.minPrice || filters.maxPrice) && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Products Grid/List */}
        {filteredProducts.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {filteredProducts.map((product) => (
              <div key={product.id} className={viewMode === 'list' ? 'bg-white rounded-lg p-4 shadow-sm' : ''}>
                {viewMode === 'grid' ? (
                  <ProductCard product={product} />
                ) : (
                  // List View Layout
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = `https://via.placeholder.com/80x80/6c757d/ffffff?text=${encodeURIComponent(product.name.charAt(0))}`
                        }}
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                      {product.brand && (
                        <p className="text-sm text-blue-600 font-medium mb-2">{product.brand}</p>
                      )}
                      {product.specs && (
                        <p className="text-sm text-gray-600 mb-2">{product.specs}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-xl font-bold text-gray-900 mb-2">
                        {formatPrice(product.price)}
                      </div>
                      <ProductCard product={product} viewMode="list" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          // No results found (but products exist)
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              No Products Match Your Search
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm ? (
                <>We couldn't find any products matching "<strong>{searchTerm}</strong>". Try different keywords or adjust your filters.</>
              ) : (
                'No products match your current filters. Try adjusting your selection to see more results.'
              )}
            </p>
            <div className="space-x-4">
              <button
                onClick={clearFilters}
                className="btn btn-primary"
              >
                Clear All Filters
              </button>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="btn btn-secondary"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        ) : (
          // No products at all
          <div className="text-center py-16">
            <div className="text-6xl mb-6">{currentCategory.icon}</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              No Products Available
            </h3>
            <p className="text-gray-600 mb-6">
              We're currently stocking this category. Please check back soon for amazing {currentCategory.title.toLowerCase()}!
            </p>
            <button
              onClick={fetchProducts}
              className="btn btn-primary"
            >
              Refresh Products
            </button>
          </div>
        )}

        {/* Load More Button (if needed) */}
        {filteredProducts.length > 20 && (
          <div className="text-center mt-12">
            <button className="btn btn-secondary">
              Load More Products
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoryPage