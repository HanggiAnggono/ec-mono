import { LoginResponseDto } from '@/shared/types/api'
import { fetchClient } from '../core'
import { QueryClient } from '@tanstack/react-query'

let isRefreshing = false
let failedQueue: Array<() => void> = []

type Resolve = { queues: typeof failedQueue; response?: LoginResponseDto }

export function fetchFefreshToken({
  refreshToken,
  callback = () => {},
}): Promise<Resolve> {
  return new Promise<Resolve>((resolve, reject) => {
    if (!refreshToken) {
      return reject('No refresh token')
    }

    failedQueue.push(() => {
      callback()
      failedQueue = failedQueue.filter((cb) => cb !== callback)
    })

    if (isRefreshing) {
      return
    }

    isRefreshing = true
    return fetchClient
      .POST('/auth/refresh-token', {
        body: { refreshToken },
      })
      .then((res) => {
        isRefreshing = false
        resolve({ queues: failedQueue, response: res.data })
      })
      .catch((error) => {
        reject()
      })
  })
}
