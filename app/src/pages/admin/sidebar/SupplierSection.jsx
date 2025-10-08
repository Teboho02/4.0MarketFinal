import { Plus, Building } from 'lucide-react'

const SupplierSection = ({ suppliers, products }) => {
  const getSupplierProductCount = (supplierId) => {
    return products.filter(p => p.supplier_id === supplierId).length
  }

  return (
    <div className="sidebar-section">
      <div className="flex justify-between items-center mb-3">
        <h3 className="sidebar-title flex items-center">
          <Building className="w-4 h-4 mr-2" />
          Suppliers
        </h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {suppliers.length}
        </span>
      </div>
      
      <ul className="sidebar-list">
        {suppliers.map(supplier => {
          const productCount = getSupplierProductCount(supplier.id)
          return (
            <li key={supplier.id} className="sidebar-item">
              <div className="flex justify-between items-start w-full">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {supplier.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {supplier.contact} • {supplier.email}
                  </div>
                </div>
                <span className={`sidebar-item-count ml-2 flex-shrink-0 ${
                  productCount === 0 ? 'bg-gray-100 text-gray-500' : ''
                }`}>
                  {productCount}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
      
      <button className="btn btn-primary w-full mt-2 flex items-center justify-center">
        <Plus className="w-4 h-4 mr-2" />
        Add Supplier
      </button>
    </div>
  )
}

export default SupplierSection