import { create } from 'zustand'
import { combine, persist } from 'zustand/middleware'
import { zustandStorage } from './persistence'

export const useCart = create(
  persist(
    combine(
      {
        cartSessionId: undefined as string | undefined,
      },
      (set, get) => {
        return {
          setCartSessionId: (cartSessionId: string) => set({ cartSessionId }),
        }
      }
    ),
    {
      name: 'cart-store',
      // @ts-ignore
      storage: zustandStorage,
    }
  )
)
