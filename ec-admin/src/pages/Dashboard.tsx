import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'

function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-600">Welcome to EC Admin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-medium text-gray-900">Categories</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">0</p>
        </Card>

        <Card>
          <h3 className="text-lg font-medium text-gray-900">Products</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">0</p>
        </Card>

        <Card>
          <h3 className="text-lg font-medium text-gray-900">Orders</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
        </Card>
      </div>

      <Card title="Quick Actions">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/categories">
            <Button variant="primary" className="w-full">
              Manage Categories
            </Button>
          </Link>
          <Link to="/">
            <Button variant="secondary" className="w-full">
              Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default Dashboard