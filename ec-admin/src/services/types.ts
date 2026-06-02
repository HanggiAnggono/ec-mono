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
