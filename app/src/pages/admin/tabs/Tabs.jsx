import ProductList from './ProductList'
import OrderList from './OrderList'
import AddEditProduct from './AddEditProduct'

const Tabs = ({
  activeTab,
  onTabChange,
  products,
  orders,
  suppliers,
  loading,
  error,
  onDeleteProduct,
  onRefresh,
  selectedCategory
}) => {
  return (
    <>
      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => onTabChange('products')}
        >
          Products
        </div>
        <div 
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => onTabChange('orders')}
        >
          Orders
        </div>
        <div 
          className={`tab ${activeTab === 'add-product' ? 'active' : ''}`}
          onClick={() => onTabChange('add-product')}
        >
          Add Product
        </div>
      </div>

      {activeTab === 'products' && (
        <ProductList 
          products={products}
          suppliers={suppliers}
          loading={loading}
          error={error}
          onDelete={onDeleteProduct}
          onRefresh={onRefresh}
          selectedCategory={selectedCategory}
          onAddProduct={() => onTabChange('add-product')}
          onViewOrders={() => onTabChange('orders')}
        />
      )}

      {activeTab === 'orders' && (
        <OrderList 
          orders={orders}
          onBackToProducts={() => onTabChange('products')}
        />
      )}

      {activeTab === 'add-product' && (
        <AddEditProduct 
          onSuccess={() => {
            onRefresh()
            onTabChange('products')
          }}
          onCancel={() => onTabChange('products')}
          suppliers={suppliers}
        />
      )}
    </>
  )
}

export default Tabs