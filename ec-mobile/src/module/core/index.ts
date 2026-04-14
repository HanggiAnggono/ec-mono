import { paths } from '@/shared/types/api'
import createFetchClient from 'openapi-fetch'
import createClient from 'openapi-react-query'

export const fetchClient = createFetchClient<paths>({
  baseUrl: process.env.EXPO_PUBLIC_API_URL,
})

export const apiClient = createClient(fetchClient)
