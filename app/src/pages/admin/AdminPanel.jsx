import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { Plus, Package, Edit3, Trash2, Upload, Save } from 'lucide-react'
import { productService } from '../../services/productService'

const AdminPanel = () => {
  const location = useLocation()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await productService.getAllProducts()
      setProducts(data)
    } catch (err) {
      setError(err.message || 'Failed to load products')
    } finally {
      setLoading(false)
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

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage your products and inventory</p>
        </div>

        <Routes>
          <Route path="/" element={<ProductList products={products} loading={loading} error={error} onDelete={deleteProduct} onRefresh={fetchProducts} />} />
          <Route path="/add-product" element={<AddEditProduct onSuccess={fetchProducts} />} />
          <Route path="/edit-product/:id" element={<AddEditProduct onSuccess={fetchProducts} />} />
        </Routes>
      </div>
    </div>
  )
}

const ProductList = ({ products, loading, error, onDelete, onRefresh }) => {
  const formatPrice = (price) => {
    return `R${parseFloat(price).toLocaleString('en-ZA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="spinner mb-4" />
        <p className="text-gray-600">Loading products...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Products</h2>
        <Link to="/admin/add-product" className="btn btn-primary flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Link>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          {error}
          <button onClick={onRefresh} className="ml-4 underline">
            Try Again
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg mr-4"
                        onError={(e) => {
                          e.target.src = `https://via.placeholder.com/48x48/6c757d/ffffff?text=${encodeURIComponent(product.name.charAt(0))}`
                        }}
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        {product.brand && (
                          <div className="text-sm text-gray-500">
                            {product.brand}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.stock || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        to={`/admin/edit-product/${product.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => onDelete(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">Get started by adding your first product.</p>
            <Link to="/admin/add-product" className="btn btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

const AddEditProduct = ({ onSuccess }) => {
  const location = useLocation()
  const isEditing = location.pathname.includes('/edit-product/')
  const productId = isEditing ? location.pathname.split('/').pop() : null

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    specs: '',
    brand: '',
    description: '',
    image_url: ''
  })
  const [imageFile, setImageFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (isEditing && productId) {
      fetchProduct()
    }
  }, [isEditing, productId])

  const fetchProduct = async () => {
    try {
      const product = await productService.getProductById(productId)
      setFormData(product)
    } catch (err) {
      setError('Failed to load product: ' + err.message)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    setImageFile(file)
    
    // Preview image
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          image_url: e.target.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      let imageUrl = formData.image_url

      // Upload image if a new file is selected
      if (imageFile) {
        imageUrl = await productService.uploadImage(imageFile)
      }

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        image_url: imageUrl
      }

      if (isEditing) {
        await productService.updateProduct(productId, productData)
        setSuccess('Product updated successfully!')
      } else {
        await productService.createProduct(productData)
        setSuccess('Product created successfully!')
        // Reset form for new product
        setFormData({
          name: '',
          category: '',
          price: '',
          stock: '',
          specs: '',
          brand: '',
          description: '',
          image_url: ''
        })
        setImageFile(null)
      }

      onSuccess()
    } catch (err) {
      setError(err.message || 'Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link to="/admin" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Back to Products
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </h2>
      </div>

      {error && <div className="alert alert-error mb-6">{error}</div>}
      {success && <div className="alert alert-success mb-6">{success}</div>}

      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="form-label">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select category</option>
                <option value="laptops">Laptops</option>
                <option value="smartphones">Smartphones</option>
                <option value="gaming">Gaming</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>

            <div>
              <label className="form-label">Price (R) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="form-input"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="form-label">Stock Quantity</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                className="form-input"
                min="0"
              />
            </div>

            <div>
              <label className="form-label">Brand</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Specifications</label>
              <input
                type="text"
                name="specs"
                value={formData.specs}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g. 8GB RAM • 256GB SSD • 15.6 inch"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-textarea"
              rows="3"
            />
          </div>

          <div>
            <label className="form-label">Product Image</label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="form-input"
              />
              <Upload className="w-5 h-5 text-gray-400" />
            </div>
            {formData.image_url && (
              <div className="mt-4">
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex items-center"
            >
              {loading ? (
                <>
                  <div className="spinner mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update Product' : 'Add Product'}
                </>
              )}
            </button>
            <Link to="/admin" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminPanel