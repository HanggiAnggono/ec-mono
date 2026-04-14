import { useCartGetCart } from '@/shared/query/cart/use-cart-get-cart.query'
import { useCart } from '@/store/cart.store'
import { useEffect } from 'react'

export const useGetCart = () => {
  const { cartSessionId, setCartSessionId } = useCart()

  const query = useCartGetCart({
    params: { query: { sessionId: getSessionId() } },
  })

  const { data: cart } = query

  function getSessionId() {
    let sessionId = cartSessionId

    if (!cart && !cartSessionId) {
      sessionId = ''
    }
    return sessionId
  }

  useEffect(() => {
    if (cart?.sessionId && cart.sessionId !== cartSessionId) {
      setCartSessionId(cart.sessionId)
    }
  }, [cart?.sessionId, cartSessionId])

  return query
}
