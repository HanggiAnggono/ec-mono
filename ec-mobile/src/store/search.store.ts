import { create } from 'zustand'
import { combine, persist } from 'zustand/middleware'
import { zustandStorage } from './persistence'

const MAX_RECENT_SEARCHES = 10

export const useSearchStore = create(
  persist(
    combine(
      { recentSearches: [] } as { recentSearches: string[] },
      (set, get) => ({
        addRecentSearch: (keyword: string) => {
          const trimmed = keyword.trim()
          if (!trimmed) return
          const filtered = get().recentSearches.filter(
            (s) => s.toLowerCase() !== trimmed.toLowerCase()
          )
          set({ recentSearches: [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES) })
        },
        clearRecentSearches: () => set({ recentSearches: [] }),
        removeRecentSearch: (keyword: string) => {
          set({
            recentSearches: get().recentSearches.filter(
              (s) => s.toLowerCase() !== keyword.toLowerCase()
            ),
          })
        },
      })
    ),
    {
      name: 'search-store',
      // @ts-ignore
      storage: zustandStorage,
    }
  )
)
