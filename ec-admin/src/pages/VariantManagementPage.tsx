import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Dialog } from '../components/ui/Dialog'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHeadCell,
  TableHeader,
  TableRow,
} from '../components/ui/Table'
import { productsApi, variantsApi } from '../services'
import type { Variant, Product } from '../services'

function VariantManagementPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const id = Number(productId)

  const [product, setProduct] = useState<Product | null>(null)
  const [variants, setVariants] = useState<Variant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Variant form state
  const [isVariantFormOpen, setIsVariantFormOpen] = useState(false)
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null)
  const [variantForm, setVariantForm] = useState({ name: '', price: 0 })
  const [savingVariant, setSavingVariant] = useState(false)

  const loadVariants = async () => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    try {
      const full = await productsApi.getProduct(id)
      setProduct(full)
      setVariants(full.variants ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadVariants()
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/rules-of-hooks
  }, [id])

  const openAddVariantForm = () => {
    setEditingVariant(null)
    setVariantForm({ name: '', price: 0 })
    setIsVariantFormOpen(true)
  }

  const openEditVariantForm = (variant: Variant) => {
    setEditingVariant(variant)
    setVariantForm({ name: variant.name, price: variant.price })
    setIsVariantFormOpen(true)
  }

  const closeVariantForm = () => {
    setIsVariantFormOpen(false)
    setEditingVariant(null)
  }

  const handleVariantSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSavingVariant(true)

    try {
      if (editingVariant) {
        await variantsApi.updateVariant(editingVariant.id, variantForm)
      } else {
        await variantsApi.addVariants(id, [variantForm])
      }

      await loadVariants()
      closeVariantForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save variant')
    } finally {
      setSavingVariant(false)
    }
  }

  const handleDeleteVariant = async (variantId: number) => {
    if (
      window.confirm(
        'Are you sure you want to delete this variant? This action cannot be undone.'
      )
    ) {
      try {
        await variantsApi.deleteVariant(variantId)
        await loadVariants()
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to delete variant'
        )
      }
    }
  }

  const lowestPrice =
    variants.length > 0 ? Math.min(...variants.map((v) => v.price)) : 0
  const highestPrice =
    variants.length > 0 ? Math.max(...variants.map((v) => v.price)) : 0
  const totalStock = variants.reduce((sum, v) => sum + v.stock_quantity, 0)

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <section className="rounded-[30px] border border-[var(--line)] bg-[rgba(15,22,39,0.82)] px-6 py-7 shadow-[0_28px_72px_-44px_rgba(0,0,0,0.85)] backdrop-blur-2xl sm:px-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="font-mono text-[12px] uppercase tracking-[0.32em] text-[#cfd8ff]">
              Variant Management
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">
              {product?.name ?? 'Product Variants'}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              Manage pricing, stock, and variant options for this product.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 xl:mt-2">
            <Button
              onClick={() => navigate('/products')}
              variant="secondary"
              size="lg"
              className="min-w-[140px] justify-center"
              icon={
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 12H5" />
                  <path d="M12 19l-7-7 7-7" />
                </svg>
              }
            >
              Back
            </Button>
            <Button
              onClick={openAddVariantForm}
              variant="primary"
              size="lg"
              className="min-w-[180px] justify-center"
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
              Add Variant
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <Card>
          <p className="font-mono text-[12px] uppercase tracking-[0.24em] text-[#b7c2df]">
            Total Variants
          </p>
          <p className="mt-5 font-display text-5xl font-semibold tracking-[-0.05em] text-white">
            {isLoading ? '—' : variants.length}
          </p>
          <p className="mt-3 text-sm text-[var(--muted)]">
            SKU options for this product.
          </p>
        </Card>
        <Card>
          <p className="font-mono text-[12px] uppercase tracking-[0.24em] text-[#b7c2df]">
            Lowest Price
          </p>
          <p className="mt-5 font-display text-5xl font-semibold tracking-[-0.05em] text-white">
            {isLoading || variants.length === 0
              ? '—'
              : `$${lowestPrice.toFixed(2)}`}
          </p>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Cheapest available variant.
          </p>
        </Card>
        <Card>
          <p className="font-mono text-[12px] uppercase tracking-[0.24em] text-[#b7c2df]">
            Highest Price
          </p>
          <p className="mt-5 font-display text-5xl font-semibold tracking-[-0.05em] text-white">
            {isLoading || variants.length === 0
              ? '—'
              : `$${highestPrice.toFixed(2)}`}
          </p>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Most expensive variant.
          </p>
        </Card>
        <Card>
          <p className="font-mono text-[12px] uppercase tracking-[0.24em] text-[#b7c2df]">
            Total Stock
          </p>
          <p className="mt-5 font-display text-5xl font-semibold tracking-[-0.05em] text-white">
            {isLoading ? '—' : totalStock}
          </p>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Combined inventory across all variants.
          </p>
        </Card>
      </section>

      {/* Error Banner */}
      {error && (
        <div className="rounded-[22px] border border-[#f2a5a955] bg-[#f2a5a910] px-5 py-4 text-sm text-[#ffd3d7]">
          {error}
        </div>
      )}

      {/* Variants Table */}
      <section>
        <Table loading={isLoading}>
          <TableHeader>
            <TableRow className="border-t-0 hover:bg-transparent">
              <TableHeadCell>Variant Name</TableHeadCell>
              <TableHeadCell className="text-right">Price</TableHeadCell>
              <TableHeadCell className="text-right">Stock Quantity</TableHeadCell>
              <TableHeadCell className="text-right">Actions</TableHeadCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((variant) => (
              <TableRow key={variant.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-[var(--line)] bg-[rgba(167,180,255,0.08)]">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4 text-[#cad3ff]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M20 7V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2" />
                        <path d="M20 7v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7" />
                        <path d="M8 3v4" />
                        <path d="M12 3v4" />
                        <path d="M16 3v4" />
                      </svg>
                    </div>
                    <span className="text-base font-semibold text-white">
                      {variant.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-base font-semibold text-white">
                    ${variant.price.toFixed(2)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={
                      variant.stock_quantity > 10
                        ? 'success'
                        : variant.stock_quantity > 0
                          ? 'warning'
                          : 'danger'
                    }
                    size="md"
                  >
                    {variant.stock_quantity}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-3">
                    <Button
                      onClick={() => openEditVariantForm(variant)}
                      variant="secondary"
                      size="sm"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteVariant(variant.id)}
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

        {!isLoading && variants.length === 0 && (
          <div className="rounded-[26px] border border-[var(--line)] border-t-0 bg-[rgba(22,31,53,0.9)] px-6 py-14 text-center text-[var(--muted)]">
            No variants yet.{' '}
            <button
              onClick={openAddVariantForm}
              className="text-[#cad3ff] underline underline-offset-2 hover:text-white"
            >
              Add the first variant
            </button>
          </div>
        )}
      </section>

      {/* Add / Edit Variant Dialog */}
      <Dialog
        isOpen={isVariantFormOpen}
        title={editingVariant ? 'Edit Variant' : 'Add New Variant'}
        onClose={() => closeVariantForm()}
      >
        <form onSubmit={handleVariantSubmit} className="space-y-5">
          <Input
            label="Variant Name"
            value={variantForm.name}
            onChange={(e) =>
              setVariantForm({ ...variantForm, name: e.target.value })
            }
            placeholder="e.g. Small, Large, Red, Blue"
            required
          />
          <Input
            label="Price"
            type="number"
            min={0}
            step={0.01}
            value={variantForm.price}
            onChange={(e) =>
              setVariantForm({
                ...variantForm,
                price: Number(e.target.value),
              })
            }
            required
          />
          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              onClick={closeVariantForm}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={savingVariant}>
              {editingVariant ? 'Update Variant' : 'Add Variant'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}

export default VariantManagementPage