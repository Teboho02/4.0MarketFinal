import { useState, useEffect } from 'react'
import Sidebar from './sidebar/Sidebar'
import Tabs from './tabs/Tabs'
import { productService } from '../../services/productService'
import { supplierService } from './services/SupplierService'

const AdminPanel = () => {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [supplierStats, setSupplierStats] = useState(null)
  const [supplierPagination, setSupplierPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 1
  })
  const [couriers, setCouriers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [activeTab, setActiveTab] = useState('products')
  const [supplierFilters, setSupplierFilters] = useState({
    page: 1,
    limit: 50,
    is_active: null,
    search: '',
    country: '',
    province: '',
    city: ''
  })

  // Sample data for orders and couriers
  const sampleCouriers = [
    { id: 1, name: 'FastShip Courier', contact: '+27 11 123 4567', active: true },
    { id: 2, name: 'Express Delivery', contact: '+27 21 987 6543', active: true },
  ]

  const sampleOrders = [
    { id: 1, customer: 'John Doe', total: 1250.00, status: 'pending', date: '2024-01-15' },
    { id: 2, customer: 'Jane Smith', total: 850.50, status: 'completed', date: '2024-01-14' },
  ]

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    
    const loadSuppliers = async () => {
      try {
        await fetchSuppliers(controller.signal)
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error in supplier fetch effect:', err)
        }
      }
    }
    
    loadSuppliers()
    
    return () => controller.abort()
  }, [supplierFilters])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Fetch data in parallel but handle individual errors
      // Note: fetchSuppliers is called separately by the useEffect
      const results = await Promise.allSettled([
        fetchProducts(),
        fetchSupplierStats()
      ])
      
      // Check for individual errors
      const errors = results
        .filter(result => result.status === 'rejected')
        .map(result => result.reason.message)
      
      if (errors.length > 0) {
        console.warn('Some data failed to load:', errors)
      }
      
      // Set sample data
      setCouriers(sampleCouriers)
      setOrders(sampleOrders)
    } catch (err) {
      setError(err.message || 'Failed to load data')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      // Check if productService.getProducts exists
      if (!productService || typeof productService.getAllProducts  !== 'function') {
        throw new Error('Product service is not properly configured')
      }

      const response = await productService.getAllProducts()
      
      // Handle nested response structure - adjust based on your actual products API
      const productsData = response?.data?.products || response?.data || response || []
      
      if (!Array.isArray(productsData)) {
        throw new Error('Invalid products data format')
      }
      
      setProducts(productsData)
      return productsData
    } catch (err) {
      console.error('Error fetching products:', err)
      setProducts([]) // Set empty array as fallback
      throw err
    }
  }

  const fetchSuppliers = async (signal = null) => {
    try {
      // Filter out empty values
      const cleanFilters = Object.entries(supplierFilters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null) {
          acc[key] = value
        }
        return acc
      }, {})

      const response = await supplierService.getSuppliers(cleanFilters, signal)
      
      // Handle the actual API structure: response.data.suppliers
      const suppliersData = response?.data?.suppliers || []
      const paginationData = response?.data?.pagination || {
        page: 1,
        limit: 50,
        total: suppliersData.length,
        pages: 1
      }
      
      if (!Array.isArray(suppliersData)) {
        throw new Error('Invalid suppliers data format')
      }
      
      setSuppliers(suppliersData)
      setSupplierPagination(paginationData)
      return suppliersData
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error fetching suppliers:', err)
        setSuppliers([]) // Set empty array as fallback
      }
      // Don't throw here to allow other data to load
    }
  }

  const fetchSupplierStats = async () => {
    try {
      const stats = await supplierService.getSupplierStats()
      setSupplierStats(stats || null)
      return stats
    } catch (err) {
      console.error('Error fetching supplier stats:', err)
      setSupplierStats(null)
      // Don't throw here to allow other data to load
    }
  }

  const deleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(id)
        setProducts(products.filter(p => p.id !== id))
      } catch (err) {
        alert('Failed to delete product: ' + err.message)
      }
    }
  }

  const deleteSupplier = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await supplierService.deleteSupplier(id)
        setSuppliers(suppliers.filter(s => s.id !== id))
        // Refresh stats after deletion
        fetchSupplierStats()
      } catch (err) {
        alert('Failed to delete supplier: ' + err.message)
      }
    }
  }

  const createSupplier = async (supplierData) => {
    try {
      const response = await supplierService.createSupplier(supplierData)
      // Handle nested response if API returns {data: {supplier: {...}}}
      const newSupplier = response?.data?.supplier || response?.data || response
      setSuppliers(prev => [...prev, newSupplier])
      // Refresh stats after creation
      fetchSupplierStats()
      return newSupplier
    } catch (err) {
      throw new Error('Failed to create supplier: ' + err.message)
    }
  }

  const updateSupplier = async (id, supplierData) => {
    try {
      const response = await supplierService.updateSupplier(id, supplierData)
      // Handle nested response if API returns {data: {supplier: {...}}}
      const updatedSupplier = response?.data?.supplier || response?.data || response
      setSuppliers(prev => prev.map(s => s.id === id ? updatedSupplier : s))
      return updatedSupplier
    } catch (err) {
      throw new Error('Failed to update supplier: ' + err.message)
    }
  }

  const handleSupplierFilterChange = (filters) => {
    setSupplierFilters(prev => ({
      ...prev,
      ...filters,
      page: 1 // Reset to first page when filters change
    }))
  }

  const handleSupplierPageChange = (page) => {
    setSupplierFilters(prev => ({
      ...prev,
      page
    }))
  }

  const getProductsByCategory = (category) => {
    if (category === 'all') return products
    return products.filter(product => product.category === category)
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage your products, suppliers, and inventory</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">Error: {error}</p>
            <button 
              onClick={fetchData}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try Again
            </button>
          </div>
        )}

        <div className="admin-layout">
          <Sidebar
            products={products}
            suppliers={suppliers}
            supplierStats={supplierStats}
            couriers={couriers}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          
          <div className="main-content">
            <Tabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              products={getProductsByCategory(selectedCategory)}
              orders={orders}
              suppliers={suppliers}
              supplierStats={supplierStats}
              supplierFilters={supplierFilters}
              supplierPagination={supplierPagination}
              loading={loading}
              error={error}
              onDeleteProduct={deleteProduct}
              onDeleteSupplier={deleteSupplier}
              onCreateSupplier={createSupplier}
              onUpdateSupplier={updateSupplier}
              onSupplierFilterChange={handleSupplierFilterChange}
              onSupplierPageChange={handleSupplierPageChange}
              onRefresh={fetchData}
              selectedCategory={selectedCategory}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel