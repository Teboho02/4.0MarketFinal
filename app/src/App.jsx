import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import CategoryPage from './pages/CategoryPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import AdminPanel from './pages/admin/AdminPanel'
import OrderConfirmation from './pages/OrderConfirmation'
import ProtectedRoute from './components/ProtectedRoute'
import ProductDetail from './pages/ProductDetail'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import OrdersPage from './pages/OrdersPage'
function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPanel />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App