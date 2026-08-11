import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import Dashboard from './pages/Dashboard'
import ProductCategoryPage from './pages/ProductCategoryPage'
import ProductManagementPage from './pages/ProductManagementPage'
import VariantManagementPage from './pages/VariantManagementPage'
import OrderManagementPage from './pages/OrderManagementPage'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from './components/ui/Sonner'

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="categories" element={<ProductCategoryPage />} />
              <Route path="products" element={<ProductManagementPage />} />
              <Route path="products/:productId/variants" element={<VariantManagementPage />} />
              <Route path="orders" element={<OrderManagementPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}
export default App