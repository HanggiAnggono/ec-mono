import { create } from 'zustand'
import { combine, persist } from 'zustand/middleware'
import { zustandStorage } from './persistence'
import { LoginResponseDto } from '@/shared/types/api'

export const useAuthStore = create(
  persist(
    combine({} as Partial<LoginResponseDto>, (set, get) => {
      return {
        setAuthStore: (auth: Partial<LoginResponseDto>) =>
          set({ ...get(), ...auth }),
      }
    }),
    {
      name: 'auth-store',
      // @ts-ignore
      storage: zustandStorage,
    }
  )
)

interface AccountStoreItem {
  username: string
  token: string
  refreshToken: string
}

export const useAccountStore = create(
  persist(
    combine(
      { accounts: {} } as { accounts: Record<string, AccountStoreItem> },
      (set, get) => {
        return {
          addAccount: (account: AccountStoreItem) =>
            set({
              accounts: {
                ...get().accounts,
                [account.username]: account,
              },
            }),
          removeAccount: (username: string) => {
            const accounts = get().accounts
            delete accounts[username]
            set({ accounts })
          },
        }
      }
    ),
    {
      name: 'account-store',
      // @ts-ignore
      storage: zustandStorage,
    }
  )
)
