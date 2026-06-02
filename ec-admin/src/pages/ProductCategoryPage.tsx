import { useEffect, useState } from 'react'
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
import { productCategoryApi } from '../services'

interface Category {
  id: number
  name: string
  description: string
}

function ProductCategoryPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [query, setQuery] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  const loadCategories = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await productCategoryApi.getCategories()
      setCategories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      await loadCategories()
    }
    void init()
  }, [])

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        description: category.description || '',
      })
    } else {
      setEditingCategory(null)
      setFormData({
        name: '',
        description: '',
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      if (editingCategory) {
        await productCategoryApi.updateCategory(editingCategory.id, {
          name: formData.name,
          description: formData.description,
        })
      } else {
        await productCategoryApi.createCategory({
          name: formData.name,
          description: formData.description,
        })
      }

      await loadCategories()
      closeModal()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category')
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await productCategoryApi.deleteCategory(id)
        await loadCategories()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete category')
      }
    }
  }

  const normalizedQuery = query.trim().toLowerCase()
  const filteredCategories = categories.filter((category) => {
    if (!normalizedQuery) return true
    return (
      category.name.toLowerCase().includes(normalizedQuery) ||
      category.description.toLowerCase().includes(normalizedQuery)
    )
  })

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-[var(--line)] bg-[rgba(15,22,39,0.82)] px-6 py-7 shadow-[0_28px_72px_-44px_rgba(0,0,0,0.85)] backdrop-blur-2xl sm:px-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="font-mono text-[12px] uppercase tracking-[0.32em] text-[#cfd8ff]">Catalog Control</p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">
              Product Categories
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              Structure the taxonomy that powers browsing, merchandising, and product discovery.
            </p>
          </div>

          <Button
            onClick={() => openModal()}
            variant="primary"
            size="lg"
            className="min-w-[220px] justify-center xl:mt-2"
            icon={
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
            }
          >
            Add New Category
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <p className="font-mono text-[12px] uppercase tracking-[0.24em] text-[#b7c2df]">Total Categories</p>
          <p className="mt-5 font-display text-5xl font-semibold tracking-[-0.05em] text-white">
            {isLoading ? '—' : categories.length}
          </p>
          <p className="mt-3 text-sm text-[var(--muted)]">All catalog groups currently available to products.</p>
        </Card>
        <Card>
          <p className="font-mono text-[12px] uppercase tracking-[0.24em] text-[#b7c2df]">Filtered View</p>
          <p className="mt-5 font-display text-5xl font-semibold tracking-[-0.05em] text-white">
            {isLoading ? '—' : filteredCategories.length}
          </p>
          <p className="mt-3 text-sm text-[var(--muted)]">Live result count based on the current search criteria.</p>
        </Card>
        <Card>
          <p className="font-mono text-[12px] uppercase tracking-[0.24em] text-[#b7c2df]">Sync Status</p>
          <div className="mt-5 flex items-center gap-3">
            <Badge variant={error ? 'danger' : 'success'} size="lg">
              {error ? 'Attention' : 'Synced'}
            </Badge>
          </div>
          <p className="mt-3 text-sm text-[var(--muted)]">
            {error ? 'Backend action needs attention before the next update.' : 'Category service is ready for edits.'}
          </p>
        </Card>
      </section>

      <section className="rounded-[26px] border border-[var(--line)] bg-[rgba(22,31,53,0.88)] p-4 shadow-[0_24px_64px_-42px_rgba(0,0,0,0.85)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <div className="xl:min-w-0 xl:flex-1">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by category name or description..."
              icon={
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="6" />
                  <path d="m20 20-4.2-4.2" />
                </svg>
              }
            />
          </div>

          <div className="h-px bg-[var(--line)] xl:h-12 xl:w-px" />

          <div className="grid gap-3 sm:grid-cols-2 xl:w-[380px]">
            <div className="rounded-[18px] border border-[var(--line)] bg-[#0d1427] px-4 py-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#b4bfdc]">Segment</p>
              <p className="mt-2 text-sm text-white">All Categories</p>
            </div>
            <div className="rounded-[18px] border border-[var(--line)] bg-[#0d1427] px-4 py-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#b4bfdc]">Status</p>
              <p className="mt-2 text-sm text-white">{error ? 'Needs Review' : 'All Statuses'}</p>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-[22px] border border-[#f2a5a955] bg-[#f2a5a910] px-5 py-4 text-sm text-[#ffd3d7]">
          {error}
        </div>
      )}

      <section>
        <Table loading={isLoading}>
          <TableHeader>
            <TableRow className="border-t-0 hover:bg-transparent">
              <TableHeadCell>Name</TableHeadCell>
              <TableHeadCell>Description</TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
              <TableHeadCell className="text-right">Actions</TableHeadCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <div>
                    <div className="text-base font-semibold text-white">{category.name}</div>
                    <div className="font-mono text-xs uppercase tracking-[0.16em] text-[#7f8aab]">
                      Category ID: {category.id}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="max-w-[420px] whitespace-normal">
                  <div className="text-sm leading-6 text-[#b1bad7]">{category.description || 'No description provided.'}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="info">Active</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-3">
                    <Button onClick={() => openModal(category)} variant="secondary" size="sm">
                      Edit
                    </Button>
                    <Button onClick={() => handleDelete(category.id)} variant="danger" size="sm">
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {!isLoading && filteredCategories.length === 0 && (
          <div className="rounded-[26px] border border-[var(--line)] border-t-0 bg-[rgba(22,31,53,0.9)] px-6 py-14 text-center text-[var(--muted)]">
            {categories.length === 0
              ? 'No categories found. Add your first category to start organizing the catalog.'
              : 'No categories match the current filter.'}
          </div>
        )}
      </section>

      <Dialog
        isOpen={isModalOpen}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
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
            <label htmlFor="description" className="mb-2 block font-mono text-xs uppercase tracking-[0.2em] text-[#cfd8ff]">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="block w-full rounded-[16px] border border-[var(--line)] bg-[#0d1427] px-4 py-3 text-slate-100 outline-none transition placeholder:text-[var(--muted)] focus:border-[#d3dbff] focus:shadow-[0_0_0_3px_rgba(188,202,255,0.14)]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" onClick={closeModal} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingCategory ? 'Update Category' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}

export default ProductCategoryPage
