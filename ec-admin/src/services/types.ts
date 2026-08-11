export interface ProductCategory {
  id: number
  name: string
  description: string
  products?: unknown[]
}

export interface Product {
  id: number
  name: string
  description: string
  category: {
    id: number
    name: string
    description: string
  }
  categoryId?: number
  variants?: Variant[]
}

export interface Variant {
  id: number
  name: string
  price: number
  stock_quantity: number
}

export interface PaginatedResponse<T> {
  data: T[]
  totalPage: number
  totalRecords: number
  limit: number
  page: number
}

export interface User {
  id: number
  username: string
  email: string
  firstname?: string
  lastname?: string
  phone?: string
}

export type OrderStatus =
  | 'pending'
  | 'pending_payment'
  | 'payment_received'
  | 'order_confirmed'
  | 'failed'
  | 'expired'
  | 'awaiting_shipment'
  | 'on_hold'
  | 'awaiting_pickup'
  | 'completed'
  | 'cancelled'

export interface OrderItem {
  id: number
  quantity: number
  price: number
  productVariant?: {
    id: number
    name: string
    product?: { id: number; name: string }
  }
}

export interface OrderAddress {
  id: string
  label: string
  address: string
  description?: string
}

export interface Order {
  id: string
  user?: User
  orderItems: OrderItem[]
  orderAddress?: OrderAddress
  orderDate: string
  totalAmount: number
  order_status: OrderStatus
}

export interface LoginResponse {
  token: string
  refreshToken: string
  user: User
}

