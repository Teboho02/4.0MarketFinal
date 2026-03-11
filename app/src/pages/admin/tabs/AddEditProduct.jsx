import { useState } from 'react'
import { Save, Upload, X, ArrowUp, ArrowDown } from 'lucide-react'
import LoadingSpinner from '../common/LoadingSpinner'
import { productService } from '../../../services/productService'

const AddEditProduct = ({ onSuccess, onCancel, suppliers, product = null }) => {
  const isEditMode = !!product

  const [formData, setFormData] = useState({
    name: product?.name || '',
    category_id: product?.category_id || '',
    supplier_sku: product?.supplier_sku || '',
    sku: product?.sku || '',
    wholesale_price: product?.wholesale_price || '',
    retail_price: product?.retail_price || '',
    stock_quantity: product?.stock_quantity || '',
    supplier_id: product?.supplier_id || '',
    brand: product?.brand || '',
    specifications: product?.specifications || '',
    description: product?.description || '',
    tags: product?.tags || [],
    insurance_type: product?.insurance_type || 'none'
  })
  
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState(
    product?.images?.map((url, index) => ({
      id: `existing-${index}`,
      url: url,
      isExisting: true
    })) || []
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

const generateSKU = (productName, category) => {
  const now = new Date()
  const dateStr = now.getFullYear().toString().substr(-2) + 
                 (now.getMonth() + 1).toString().padStart(2, '0') + 
                 now.getDate().toString().padStart(2, '0')
  
  // Handle empty product name
  const productPrefix = productName 
    ? productName.substring(0, 2).toUpperCase().replace(/[^A-Z]/g, 'X') 
    : 'PD'
  
  // Ensure we have at least 2 characters
  const cleanPrefix = productPrefix.padEnd(2, 'X').substring(0, 2)
  
  const categoryCodes = {
    '1': 'LP',
    '2': 'SP', 
    '3': 'GM',
    '4': 'AC'
  }
  
  const categoryCode = categoryCodes[category] || 'OT'
  const randomNum = Math.floor(Math.random() * 900 + 100) // 100-999
  
  return `${cleanPrefix}${dateStr}-${categoryCode}${randomNum}`
}
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const next = { ...prev, [name]: value }

      if ((name === 'name' || name === 'category_id') && next.name && next.category_id) {
        next.sku = generateSKU(next.name, next.category_id)
      }

      return next
    })
  }

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target
    setFormData(prev => ({
      ...prev,
      tags: checked 
        ? [...prev.tags, value]
        : prev.tags.filter(tag => tag !== value)
    }))
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    
    if (files.length === 0) return

    const totalFiles = imagePreviews.length + files.length
    if (totalFiles > 10) {
      setError('Maximum 10 images allowed')
      return
    }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed')
        return false
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    setImageFiles(prev => [...prev, ...validFiles])

    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          url: e.target.result,
          file: file,
          isExisting: false
        }])
      }
      reader.readAsDataURL(file)
    })

    setError('')
    e.target.value = ''
  }

  const removeImage = (id) => {
    setImagePreviews(prev => {
      const removedPreview = prev.find(preview => preview.id === id)
      if (removedPreview && !removedPreview.isExisting) {
        setImageFiles(prevFiles => prevFiles.filter(file => file !== removedPreview.file))
      }
      return prev.filter(preview => preview.id !== id)
    })
  }

  const moveImage = (index, direction) => {
    setImagePreviews(prev => {
      const newPreviews = [...prev]
      const newIndex = direction === 'up' ? index - 1 : index + 1
      
      if (newIndex >= 0 && newIndex < newPreviews.length) {
        [newPreviews[index], newPreviews[newIndex]] = [newPreviews[newIndex], newPreviews[index]]
      }
      
      return newPreviews
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Remove supplier_id from required fields validation
      if (!formData.name || !formData.category_id || !formData.supplier_sku || 
          !formData.wholesale_price || !formData.retail_price) {
        throw new Error('Please fill in all required fields')
      }

      if (parseFloat(formData.retail_price) <= parseFloat(formData.wholesale_price)) {
        throw new Error('Retail price must be higher than wholesale price')
      }

      // Get only new image files (not existing ones) in the current preview order
      const newImageFiles = imagePreviews
        .filter(preview => !preview.isExisting && preview.file instanceof File)
        .map(preview => preview.file)

      const sku = formData.sku || (
        formData.name && formData.category_id
          ? generateSKU(formData.name, formData.category_id)
          : ''
      )

      const productData = {
        ...formData,
        sku,
        wholesale_price: parseFloat(formData.wholesale_price),
        retail_price: parseFloat(formData.retail_price),
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        // Only parse supplier_id if it has a value, otherwise set to null
        supplier_id: formData.supplier_id ? parseInt(formData.supplier_id) : null,
        category_id: parseInt(formData.category_id)
      }

      let response
      if (isEditMode) {
        response = await productService.updateProduct(product.id, productData, newImageFiles)
      } else {
        response = await productService.createProduct(productData, newImageFiles)
      }

      setSuccess(`Product ${isEditMode ? 'updated' : 'created'} successfully!`)
      
      if (!isEditMode) {
        // Reset form for new products
        setFormData({
          name: '',
          category_id: '',
          supplier_sku: '',
          sku: '',
          wholesale_price: '',
          retail_price: '',
          stock_quantity: '',
          supplier_id: '',
          brand: '',
          specifications: '',
          description: '',
          tags: [],
          insurance_type: 'none'
        })
        setImageFiles([])
        setImagePreviews([])
      }
      
      setTimeout(() => {
        onSuccess()
      }, 1500)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <button onClick={onCancel} className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Back to Products
        </button>
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Product' : 'Add New Product'}
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
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="form-label">Category *</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select category</option>
                <option value="1">Laptops</option>
                <option value="2">Smartphones</option>
                <option value="3">Gaming</option>
                <option value="4">Accessories</option>
              </select>
            </div>

            <div>
              <label className="form-label">Supplier Product Code *</label>
              <input
                type="text"
                name="supplier_sku"
                value={formData.supplier_sku}
                onChange={handleInputChange}
                className="form-input"
                required
                placeholder="e.g. APP-MBP-16-M2"
              />
            </div>

            <div>
              <label className="form-label">Our Product SKU</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Will be generated automatically"
              />
            </div>

            <div>
              <label className="form-label">Wholesale Price (R) *</label>
              <input
                type="number"
                name="wholesale_price"
                value={formData.wholesale_price}
                onChange={handleInputChange}
                className="form-input"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="form-label">Retail Price (R) *</label>
              <input
                type="number"
                name="retail_price"
                value={formData.retail_price}
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
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={handleInputChange}
                className="form-input"
                min="0"
              />
            </div>

            <div>
              <label className="form-label">Supplier</label> {/* Removed asterisk */}
              <select
                name="supplier_id"
                value={formData.supplier_id}
                onChange={handleInputChange}
                className="form-select"
                // Removed required attribute
              >
                <option value="">Select supplier (optional)</option> {/* Updated placeholder */}
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Brand</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter brand name"
              />
            </div>

            <div>
              <label className="form-label">Specifications</label>
              <input
                type="text"
                name="specifications"
                value={formData.specifications}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g. 8GB RAM • 256GB SSD • 15.6 inch"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Product Tags</label>
            <div className="checkbox-group">
              <div className="checkbox-item">
                <input 
                  type="checkbox" 
                  id="tag-new" 
                  name="tags" 
                  value="new"
                  checked={formData.tags.includes('new')}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="tag-new">New Product</label>
              </div>
              <div className="checkbox-item">
                <input 
                  type="checkbox" 
                  id="tag-sale" 
                  name="tags" 
                  value="sale"
                  checked={formData.tags.includes('sale')}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="tag-sale">On Sale</label>
              </div>
              <div className="checkbox-item">
                <input 
                  type="checkbox" 
                  id="tag-limited" 
                  name="tags" 
                  value="limited"
                  checked={formData.tags.includes('limited')}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="tag-limited">Limited Stock</label>
              </div>
            </div>
          </div>

          <div>
            <label className="form-label">Insurance</label>
            <div className="radio-group">
              <div className="radio-item">
                <input 
                  type="radio" 
                  id="insurance-none" 
                  name="insurance_type" 
                  value="none" 
                  checked={formData.insurance_type === 'none'}
                  onChange={handleInputChange}
                />
                <label htmlFor="insurance-none">No Insurance</label>
              </div>
              <div className="radio-item">
                <input 
                  type="radio" 
                  id="insurance-hills" 
                  name="insurance_type" 
                  value="hills" 
                  checked={formData.insurance_type === 'hills'}
                  onChange={handleInputChange}
                />
                <label htmlFor="insurance-hills">Hills Insurance</label>
              </div>
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
              placeholder="Enter product description..."
            />
          </div>

          <div>
            <label className="form-label">Product Images</label>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="form-input"
                  multiple
                />
                <Upload className="w-5 h-5 text-gray-400" />
              </div>
              
              {imagePreviews.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-3">
                    {imagePreviews.length} image(s) selected. First image will be used as primary.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={preview.id} className="relative group">
                        <img
                          src={preview.url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                        
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => moveImage(index, 'up')}
                              className="bg-white bg-opacity-90 hover:bg-opacity-100 p-1 rounded-full transition-colors"
                              title="Move up"
                            >
                              <ArrowUp className="w-4 h-4 text-gray-700" />
                            </button>
                          )}
                          
                          {index < imagePreviews.length - 1 && (
                            <button
                              type="button"
                              onClick={() => moveImage(index, 'down')}
                              className="bg-white bg-opacity-90 hover:bg-opacity-100 p-1 rounded-full transition-colors"
                              title="Move down"
                            >
                              <ArrowDown className="w-4 h-4 text-gray-700" />
                            </button>
                          )}
                          
                          <button
                            type="button"
                            onClick={() => removeImage(preview.id)}
                            className="bg-red-500 hover:bg-red-600 p-1 rounded-full transition-colors"
                            title="Remove image"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                        
                        {index === 0 && (
                          <div className="absolute top-2 left-2">
                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                              Primary
                            </span>
                          </div>
                        )}
                        
                        {preview.isExisting && (
                          <div className="absolute top-2 right-2">
                            <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                              Existing
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="text-xs text-gray-500 space-y-1">
                <p>• Maximum 10 images per product</p>
                <p>• Supported formats: JPG, PNG, WebP</p>
                <p>• Maximum file size: 5MB per image</p>
                <p>• First image will be used as the primary product image</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-4 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex items-center"
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  {isEditMode ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditMode ? 'Update Product' : 'Add Product'}
                </>
              )}
            </button>
            <button 
              type="button" 
              onClick={onCancel} 
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddEditProduct
