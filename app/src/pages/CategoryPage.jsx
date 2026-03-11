import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { productService } from '../services/productService'

const CategoryPage = () => {
  const { categoryName } = useParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('default')
  const [showSort, setShowSort] = useState(false)

  const categoryDisplayNames = {
    laptops: 'Laptops',
    smartphones: 'Smartphones',
    PC: "PC's & Monitors",
    accessories: 'Accessories',
    gaming: 'Gaming',
    iphones: 'iPhones',
    'samsung-phones': 'Samsung Phones',
  }

  const title = categoryDisplayNames[categoryName]
    || categoryName?.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    || 'Products'

  useEffect(() => {
    setSearchTerm('')
    setSortBy('default')
    fetchProducts()
  }, [categoryName])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await productService.getProductsByCategory(categoryName)
      setProducts(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  // Filter + sort
  const displayed = (() => {
    let list = [...products]

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      list = list.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      )
    }

    switch (sortBy) {
      case 'price-asc':
        list.sort((a, b) => (parseFloat(a.retail_price) || 0) - (parseFloat(b.retail_price) || 0))
        break
      case 'price-desc':
        list.sort((a, b) => (parseFloat(b.retail_price) || 0) - (parseFloat(a.retail_price) || 0))
        break
      case 'name':
        list.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        break
      default:
        break
    }

    return list
  })()

  // Group by brand for display rows (same pattern as Home)
  const grouped = displayed.reduce((acc, product) => {
    const brand = product.brand || 'Other'
    if (!acc[brand]) acc[brand] = []
    acc[brand].push(product)
    return acc
  }, {})

  const groupEntries = Object.entries(grouped)

  if (loading) {
    return (
      <div style={{ paddingTop: '112px' }} className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading {title}...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: '112px' }} className="min-h-screen bg-gray-50">

      {/* Page header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">{title}</h1>
          {!loading && (
            <p className="text-xs text-gray-400">{displayed.length} products</p>
          )}
        </div>

        {/* Sort button */}
        <div className="relative">
          <button
            onClick={() => setShowSort(!showSort)}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-1.5 hover:border-blue-400 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Sort
          </button>
          {showSort && (
            <div className="absolute right-0 top-10 bg-white border border-gray-100 rounded-xl shadow-lg z-10 w-44 overflow-hidden">
              {[
                { value: 'default', label: 'Default' },
                { value: 'price-asc', label: 'Price: Low to High' },
                { value: 'price-desc', label: 'Price: High to Low' },
                { value: 'name', label: 'Name A–Z' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setSortBy(opt.value); setShowSort(false) }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    sortBy === opt.value
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Search bar */}
      <div className="px-4 mb-4">
        <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2 gap-2 focus-within:border-blue-400 transition-colors">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')}>
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mx-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={fetchProducts} className="text-red-600 font-medium underline">Retry</button>
        </div>
      )}

      {/* Product rows — grouped by brand, same as Home */}
      <div className="pb-8">
        {groupEntries.length > 0 ? (
          groupEntries.map(([brand, brandProducts]) => (
            <section key={brand} className="mb-6">
              {/* Only show brand header if there are multiple brands */}
              {groupEntries.length > 1 && (
                <div className="px-4 mb-3">
                  <h2 className="text-base font-bold text-gray-900">{brand}</h2>
                </div>
              )}

              {/* Horizontal scroll row */}
              <div
                style={{
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'none',
                  paddingLeft: '1rem',
                  paddingRight: '1rem',
                }}
              >
                <div style={{ display: 'flex', gap: '0.75rem', width: 'max-content', paddingBottom: '0.25rem' }}>
                  {brandProducts.map(product => (
                    <div key={product.id} style={{ width: '160px', flexShrink: 0 }}>
                      <ProductCard product={product} compact />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))
        ) : (
          <div className="text-center py-16 px-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? `No results for "${searchTerm}"` : 'No Products Available'}
            </h3>
            <p className="text-gray-500 text-sm">
              {searchTerm
                ? 'Try a different search term.'
                : 'Check back soon — we\'re stocking this category.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-sm text-blue-600 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Click outside to close sort dropdown */}
      {showSort && (
        <div className="fixed inset-0 z-[9]" onClick={() => setShowSort(false)} />
      )}
    </div>
  )
}

export default CategoryPage
