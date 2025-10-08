import { Plus } from 'lucide-react'

const CategorySection = ({ products, selectedCategory, onCategoryChange }) => {
  const getCategories = () => {
    // Use category_name instead of category, and filter out undefined/null values
    const categories = products
      .map(product => product.category_name)
      .filter(category => category != null && category !== '')
    
    return [...new Set(categories)]
  }

  const getProductsByCategory = (category) => {
    if (category === 'all') return products
    return products.filter(product => product.category_name === category)
  }

  // Safe string capitalization function
  const capitalizeFirstLetter = (string) => {
    if (!string || typeof string !== 'string') return 'Uncategorized'
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  return (
    <div className="sidebar-section">
      <h3 className="sidebar-title">Categories</h3>
      <ul className="sidebar-list">
        <li 
          className={`sidebar-item ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => onCategoryChange('all')}
        >
          <span>All Products</span>
          <span className="sidebar-item-count">{products.length}</span>
        </li>
        {getCategories().map(category => {
          const categoryProducts = getProductsByCategory(category)
          return (
            <li 
              key={category}
              className={`sidebar-item ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => onCategoryChange(category)}
            >
              <span>{capitalizeFirstLetter(category)}</span>
              <span className="sidebar-item-count">{categoryProducts.length}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default CategorySection