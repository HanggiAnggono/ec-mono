import { useState } from 'react'
import type { FormEvent } from 'react'
import { toast } from 'sonner'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Dialog } from '../components/ui/Dialog'
import { Card } from '../components/ui/Card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/Select'
import {
  Table,
  TableBody,
  TableCell,
  TableHeadCell,
  TableHeader,
  TableRow,
} from '../components/ui/Table'
import { useOrders } from '../usecases/useOrders'
import { ordersApi } from '../services'
import type { Order, OrderStatus } from '../services/types'
import Pagination from '../components/ui/Pagination'

const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'pending_payment',
  'payment_received',
  'order_confirmed',
  'awaiting_shipment',
  'on_hold',
  'awaiting_pickup',
  'completed',
  'failed',
  'expired',
  'cancelled',
]

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  pending_payment: 'Pending Payment',
  payment_received: 'Payment Received',
  order_confirmed: 'Order Confirmed',
  awaiting_shipment: 'Awaiting Shipment',
  on_hold: 'On Hold',
  awaiting_pickup: 'Awaiting Pickup',
  completed: 'Completed',
  failed: 'Failed',
  expired: 'Expired',
  cancelled: 'Cancelled',
}

const STATUS_BADGE_VARIANT: Record<
  OrderStatus,
  'default' | 'success' | 'warning' | 'danger' | 'info'
> = {
  pending: 'default',
  pending_payment: 'warning',
  payment_received: 'info',
  order_confirmed: 'info',
  awaiting_shipment: 'info',
  on_hold: 'warning',
  awaiting_pickup: 'info',
  completed: 'success',
  failed: 'danger',
  expired: 'danger',
  cancelled: 'danger',
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

function OrderManagementPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [statusDialogOrder, setStatusDialogOrder] = useState<Order | null>(null)
  const [nextStatus, setNextStatus] = useState<OrderStatus>('pending')
  const [saving, setSaving] = useState(false)

  const {
    data: ordersData,
    isLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useOrders({
    page,
    take: itemsPerPage,
    status: statusFilter === 'all' ? undefined : statusFilter,
  })

  const error = ordersError instanceof Error ? ordersError.message : null
  const orders = ordersData?.data ?? []
  const totalPages = ordersData?.totalPage ?? 1
  const totalRecords = ordersData?.totalRecords ?? 0

  const openStatusDialog = (order: Order) => {
    setStatusDialogOrder(order)
    setNextStatus(order.order_status)
  }

  const closeStatusDialog = () => {
    setStatusDialogOrder(null)
  }

  const handleStatusSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!statusDialogOrder) return
    setSaving(true)

    try {
      await ordersApi.updateOrderStatus(statusDialogOrder.id, nextStatus)
      toast.success('Order status updated')
      void refetchOrders()
      closeStatusDialog()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setSaving(false)
    }
  }

  const getCustomerName = (order: Order) =>
    order.user?.firstname || order.user?.username || order.user?.email || '—'

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <section className="rounded-[30px] border border-[var(--line)] bg-[rgba(15,22,39,0.82)] px-6 py-7 shadow-[0_28px_72px_-44px_rgba(0,0,0,0.85)] backdrop-blur-2xl sm:px-8">
        <p className="font-mono text-[12px] uppercase tracking-[0.32em] text-[#cfd8ff]">
          Fulfillment
        </p>
        <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">
          Order Management
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
          Review incoming orders and update their fulfillment status.
        </p>
      </section>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <p className="font-mono text-[12px] uppercase tracking-[0.24em] text-[#b7c2df]">
            Total Orders
          </p>
          <p className="mt-5 font-display text-5xl font-semibold tracking-[-0.05em] text-white">
            {isLoading ? '—' : totalRecords}
          </p>
          <p className="mt-3 text-sm text-[var(--muted)]">
            All orders matching the current filter.
          </p>
        </Card>
        <Card>
          <p className="font-mono text-[12px] uppercase tracking-[0.24em] text-[#b7c2df]">
            Current Page
          </p>
          <p className="mt-5 font-display text-5xl font-semibold tracking-[-0.05em] text-white">
            {isLoading ? '—' : orders.length}
          </p>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Orders shown on this page.
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
            {error ? 'Backend action needs attention.' : 'Order service is ready.'}
          </p>
        </Card>
      </section>

      {/* Filters */}
      <section className="rounded-[26px] border border-[var(--line)] bg-[rgba(22,31,53,0.88)] p-4 shadow-[0_24px_64px_-42px_rgba(0,0,0,0.85)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <div className="w-full xl:max-w-xs">
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value as OrderStatus | 'all')
                setPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {ORDER_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {STATUS_LABEL[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {statusFilter !== 'all' && (
            <Button
              variant="ghost"
              size="md"
              onClick={() => {
                setStatusFilter('all')
                setPage(1)
              }}
            >
              Clear filter
            </Button>
          )}
        </div>
      </section>

      {/* Error Banner */}
      {error && (
        <div className="rounded-[22px] border border-[#f2a5a955] bg-[#f2a5a910] px-5 py-4 text-sm text-[#ffd3d7]">
          {error}
        </div>
      )}

      {/* Order Table */}
      <section>
        <Table loading={isLoading}>
          <TableHeader>
            <TableRow className="border-t-0 hover:bg-transparent">
              <TableHeadCell>Order</TableHeadCell>
              <TableHeadCell>Customer</TableHeadCell>
              <TableHeadCell>Date</TableHeadCell>
              <TableHeadCell>Total</TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
              <TableHeadCell className="text-right">Actions</TableHeadCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <span className="font-mono text-sm text-[#b1bad7]">
                    #{order.id.slice(0, 8)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-white">{getCustomerName(order)}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-[#b1bad7]">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-white">
                    {currencyFormatter.format(order.totalAmount / 100)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_BADGE_VARIANT[order.order_status]}>
                    {STATUS_LABEL[order.order_status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-3">
                    <Button
                      onClick={() => openStatusDialog(order)}
                      variant="secondary"
                      size="sm"
                    >
                      Change Status
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {!isLoading && orders.length === 0 && (
          <div className="rounded-[26px] border border-[var(--line)] border-t-0 bg-[rgba(22,31,53,0.9)] px-6 py-14 text-center text-[var(--muted)]">
            No orders found.
          </div>
        )}

        {/* Pagination */}
        <Pagination
          totalPages={totalPages}
          page={page}
          totalRecords={totalRecords}
          onPageChange={setPage}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(value) => {
            setItemsPerPage(value)
            setPage(1)
          }}
        />
      </section>

      {/* Status Change Dialog */}
      <Dialog
        isOpen={!!statusDialogOrder}
        title="Change Order Status"
        onClose={closeStatusDialog}
      >
        {statusDialogOrder && (
          <form onSubmit={handleStatusSubmit} className="space-y-5">
            <p className="text-sm text-[var(--muted)]">
              Order{' '}
              <span className="font-mono text-white">
                #{statusDialogOrder.id.slice(0, 8)}
              </span>{' '}
              — {getCustomerName(statusDialogOrder)}
            </p>

            <div>
              <label className="mb-2 block font-mono text-xs uppercase tracking-[0.2em] text-[#cfd8ff]">
                Status
              </label>
              <Select
                value={nextStatus}
                onValueChange={(value) => setNextStatus(value as OrderStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {STATUS_LABEL[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button type="button" onClick={closeStatusDialog} variant="secondary">
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={saving}>
                Save Status
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  )
}

export default OrderManagementPage
