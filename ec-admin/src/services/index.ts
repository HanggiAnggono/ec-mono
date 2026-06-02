import ApiClient from "./base-client"
import { ProductCategoryApi } from "./product-category.api"
import { ProductsApi } from "./products.api"
import { VariantsApi } from "./variants.api"

export * from './types'

// Create instances of each module API
const apiClient = new ApiClient()

export const productCategoryApi = new ProductCategoryApi()
export const productsApi = new ProductsApi()
export const variantsApi = new VariantsApi()

// For backward compatibility, export the main apiClient
export { apiClient, ApiClient, ProductCategoryApi, ProductsApi, VariantsApi }
