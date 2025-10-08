import { Plus, Truck } from 'lucide-react'

const CourierSection = ({ couriers }) => {
  const handleAddCourier = () => {
    // Implement add courier functionality
    console.log('Add courier clicked')
    // You can open a modal or navigate to a courier management page
  }

  return (
    <div className="sidebar-section">
      <div className="flex justify-between items-center mb-3">
        <h3 className="sidebar-title">Courier Companies</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {couriers.length} total
        </span>
      </div>
      
      <ul className="sidebar-list">
        {couriers.map(courier => (
          <li key={courier.id} className="sidebar-item group">
            <div className="flex items-center">
              <Truck className="w-4 h-4 mr-2 text-gray-400" />
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">{courier.name}</span>
                <span className="text-xs text-gray-500 truncate">
                  {courier.areas}
                </span>
              </div>
            </div>
            
            {/* Hover tooltip with courier info */}
            <div className="absolute invisible group-hover:visible z-10 w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-lg left-full ml-2 top-0">
              <div className="space-y-2">
                <div className="font-medium text-gray-900">{courier.name}</div>
                <div className="text-sm text-gray-600">
                  <div>Contact: {courier.contact}</div>
                  <div>Email: {courier.email}</div>
                  <div>Phone: {courier.phone}</div>
                </div>
                <div className="text-xs text-gray-500 border-t pt-2">
                  Areas: {courier.areas}
                </div>
              </div>
            </div>
          </li>
        ))}
        
        {couriers.length === 0 && (
          <li className="sidebar-item text-center text-gray-500 py-4">
            No couriers found
          </li>
        )}
      </ul>
      
      <button 
        onClick={handleAddCourier}
        className="btn btn-secondary w-full mt-2 flex items-center justify-center"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Courier
      </button>
    </div>
  )
}

export default CourierSection