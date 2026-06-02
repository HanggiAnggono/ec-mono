import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import Dashboard from './pages/Dashboard'
import ProductCategoryPage from './pages/ProductCategoryPage'
import ProductManagementPage from './pages/ProductManagementPage'
import VariantManagementPage from './pages/VariantManagementPage'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="categories" element={<ProductCategoryPage />} />
              <Route path="products" element={<ProductManagementPage />} />
              <Route path="products/:productId/variants" element={<VariantManagementPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}
export default App