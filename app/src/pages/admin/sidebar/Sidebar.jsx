import CategorySection from './CategorySection'
import SupplierSection from './SupplierSection'
import CourierSection from './CourierSection'

const Sidebar = ({ 
  products, 
  suppliers, 
  couriers, 
  selectedCategory, 
  onCategoryChange 
}) => {
  return (
    <div className="sidebar space-y-6">
      <CategorySection
        products={products}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
      />
      
      <SupplierSection
        suppliers={suppliers}
        products={products}
      />
      
      <CourierSection
        couriers={couriers}
      />
    </div>
  )
}

export default Sidebar