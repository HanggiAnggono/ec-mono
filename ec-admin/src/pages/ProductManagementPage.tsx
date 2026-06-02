import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Dialog } from '../components/ui/Dialog'
import { Card } from '../components/ui/Card'
import {
  Table,
  TableBody,
  TableCell,
  TableHeadCell,
  TableHeader,
  TableRow,
} from '../components/ui/Table'
import { apiClient } from '../services/api'

interface Product {
  id: number
  name: string
  description: string
  category: {
    id: number
    name: string
    description: string
  }
  categoryId?: number
}

interface Category {
  id: number
  name: string
  description: string
}

const defaultFormData = {
  name: '',
  description: '',
  categoryId: 0,
}

function ProductManagementPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({ ...defaultFormData })

  const loadProducts = async (searchQuery?: string, pageNum?: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const p = pageNum ?? page
      const params: {
        page?: number
        take?: number
        search?: string
      } = { page: p, take: 10 }

      const sq = searchQuery ?? query
      if (sq.trim()) params.search = sq.trim()

      const data = await apiClient.getProducts(params)
      setProducts(data.data)
      setTotalPages(data.totalPage)
      setTotalRecords(data.totalRecords)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      setIsLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await apiClient.getCategories()
      setCategories(data)
    } catch {
      // silently fail
    }
  }

  useEffect(() => {
    const init = async () => {
      await Promise.all([loadProducts(), loadCategories()])
    }
    void init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openCreateModal = () => {
    setEditingProduct(null)
    setFormData({ ...defaultFormData })
    setIsModalOpen(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      categoryId: product.categoryId ?? 0,
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
  }

  const handleSearch = () => {
    setPage(1)
    void loadProducts(query, 1)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleClear = () => {
    setQuery('')
    setPage(1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      if (editingProduct) {
        await apiClient.updateProduct(editingProduct.id, {
          name: formData.name,
          description: formData.description,
          categoryId: formData.categoryId,
        })
      } else {
        await apiClient.createProduct({
          name: formData.name,
          description: formData.description,
          categoryId: formData.categoryId,
        })
      }

      await loadProducts()
      closeModal()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        await apiClient.deleteProduct(id)
        await loadProducts()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete product')
      }
    }
  }

  const getCategoryName = (categoryId?: number) =>
    categories.find((c) => c.id === categoryId)?.name ?? `Category #${categoryId}`

  const normalizedQuery = query.trim().toLowerCase()
  const filteredProducts = products.filter((product) => {
    if (!normalizedQuery) return true
    return (
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.description.toLowerCase().includes(normalizedQuery)
    )
  })

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <section className="rounded-[30px] border border-[var(--line)] bg-[rgba(15,22,39,0.82)] px-6 py-7 shadow-[0_28px_72px_-44px_rgba(0,0,0,0.85)] backdrop-blur-2xl sm:px-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="font-mono text-[12px] uppercase tracking-[0.32em] text-[#cfd8ff]">
              Inventory Control
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">
              Product Management
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              Manage your product catalog — add new items, update details, or
              remove listings.
            </p>
          </div>

          <Button
            onClick={openCreateModal}
            variant="primary"
            size="lg"
            className="min-w-[220px] justify-center xl:mt-2"
            icon={
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
            }
          >
            Add New Product
          </Button>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <p className="font-mono text-[12px] uppercase tracking-[0.24em] text-[#b7c2df]">
            Total Products
          </p>
          <p className="mt-5 font-display text-5xl font-semibold tracking-[-0.05em] text-white">
            {isLoading ? '—' : totalRecords}
          </p>
          <p className="mt-3 text-sm text-[var(--muted)]">
            All products currently in the catalog.
          </p>
        </Card>
        <Card>
          <p className="font-mono text-[12px] uppercase tracking-[0.24em] text-[#b7c2df]">
            Filtered View
          </p>
          <p className="mt-5 font-display text-5xl font-semibold tracking-[-0.05em] text-white">
            {isLoading ? '—' : filteredProducts.length}
          </p>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Live result count based on the current search criteria.
          </p>
        </Card>
        <Card>
          <p className="font-mono text-[12px] uppercase tracking-[0.24em] text-[#b7c2df]">
            Sync Status
          </p>
          <div className="mt-5 flex items-center gap-3">
            <Badge variant={error ? 'danger' : 'success'} size="lg">
              {error ? 'Attention' : 'Synced'}
            </Badge>
          </div>
          <p className="mt-3 text-sm text-[var(--muted)]">
            {error
              ? 'Backend action needs attention.'
              : 'Product service is ready for edits.'}
          </p>
        </Card>
      </section>

      {/* Search & Filters */}
      <section className="rounded-[26px] border border-[var(--line)] bg-[rgba(22,31,53,0.88)] p-4 shadow-[0_24px_64px_-42px_rgba(0,0,0,0.85)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <div className="xl:min-w-0 xl:flex-1">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search by product name or description..."
              icon={
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="11" cy="11" r="6" />
                  <path d="m20 20-4.2-4.2" />
                </svg>
              }
            />
          </div>

          <div className="h-px bg-[var(--line)] xl:h-12 xl:w-px" />

          <div className="flex gap-3">
            <Button onClick={handleSearch} variant="secondary" size="md">
              Search
            </Button>
            {(query || page > 1) && (
              <Button variant="ghost" size="md" onClick={handleClear}>
                Clear
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Error Banner */}
      {error && (
        <div className="rounded-[22px] border border-[#f2a5a955] bg-[#f2a5a910] px-5 py-4 text-sm text-[#ffd3d7]">
          {error}
        </div>
      )}

      {/* Product Table */}
      <section>
        <Table loading={isLoading}>
          <TableHeader>
            <TableRow className="border-t-0 hover:bg-transparent">
              <TableHeadCell>Product</TableHeadCell>
              <TableHeadCell>Category</TableHeadCell>
              <TableHeadCell className="text-right">Actions</TableHeadCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div>
                    <div className="text-base font-semibold text-white">
                      {product.name}
                    </div>
                    {product.description && (
                      <div className="mt-0.5 max-w-[280px] truncate text-sm text-[#b1bad7]">
                        {product.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-[#b1bad7]">
                    {getCategoryName(product.categoryId)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-3">
                    <Button
                      onClick={() => navigate(`/products/${product.id}/variants`)}
                      variant="secondary"
                      size="sm"
                    >
                      Variants
                    </Button>
                    <Button
                      onClick={() => openEditModal(product)}
                      variant="secondary"
                      size="sm"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(product.id)}
                      variant="danger"
                      size="sm"
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {!isLoading && filteredProducts.length === 0 && (
          <div className="rounded-[26px] border border-[var(--line)] border-t-0 bg-[rgba(22,31,53,0.9)] px-6 py-14 text-center text-[var(--muted)]">
            {totalRecords === 0
              ? 'No products found. Add your first product to start building the catalog.'
              : 'No products match the current search.'}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between rounded-[26px] border border-t-0 border-[var(--line)] bg-[rgba(22,31,53,0.9)] px-6 py-4">
            <p className="text-sm text-[var(--muted)]">
              Page {page} of {totalPages} ({totalRecords} total)
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                }
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 || p === totalPages || Math.abs(p - page) <= 2
                  )
                  .map((p, idx, arr) => (
                    <span key={p} className="contents">
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-1 text-[var(--muted)]">...</span>
                      )}
                      <button
                        onClick={() => setPage(p)}
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition ${
                          p === page
                            ? 'bg-[#cad3ff] text-[#17213c] font-semibold'
                            : 'text-[#b1bad7] hover:bg-white/6 hover:text-white'
                        }`}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
              </div>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Create / Edit Dialog */}
      <Dialog
        isOpen={isModalOpen}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        onClose={() => closeModal()}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div>
            <label
              htmlFor="product-description"
              className="mb-2 block font-mono text-xs uppercase tracking-[0.2em] text-[#cfd8ff]"
            >
              Description
            </label>
            <textarea
              id="product-description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="block w-full rounded-[16px] border border-[var(--line)] bg-[#0d1427] px-4 py-3 text-slate-100 outline-none transition placeholder:text-[var(--muted)] focus:border-[#d3dbff] focus:shadow-[0_0_0_3px_rgba(188,202,255,0.14)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="product-category"
                className="mb-2 block font-mono text-xs uppercase tracking-[0.2em] text-[#cfd8ff]"
              >
                Category
              </label>
              <select
                id="product-category"
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    categoryId: Number(e.target.value),
                  })
                }
                className="block w-full rounded-[16px] border border-[var(--line)] bg-[#0d1427] px-4 py-3 text-slate-100 outline-none transition focus:border-[#d3dbff] focus:shadow-[0_0_0_3px_rgba(188,202,255,0.14)]"
                required
              >
                <option value={0} disabled>
                  Select a category
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" onClick={closeModal} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saving}>
              {editingProduct ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Dialog>

    </div>
  )
}

export default ProductManagementPage
