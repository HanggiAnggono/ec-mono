import { TextInput } from '@/components/form/textinput'
import Icon from '@/components/icon'
import { Layout } from '@/layout/layout'
import { useThemes } from '@/shared/hooks/use-themes'
import { useSearchStore } from '@/store/search.store'
import { useProductsFindAll } from '@/shared/query/products/use-products-find-all.query'
import { useFocusEffect } from '@react-navigation/native'
import { useCallback, useEffect, useMemo, useReducer } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { KeywordItem, type KeywordItemData } from './search/keyword-item'
import { SearchProductCard } from './search/search-product-card'
import { initialSearchState, searchReducer } from './search/search.reducer'
import { useDebouncedEffect } from '@/shared/hooks/use-debounced-effect'

// ─── KeywordList ──────────────────────────────────────────────────────────
const KeywordList = ({
  data,
  onSelect,
  onRemoveRecent,
  onClearRecent,
}: {
  data: KeywordItemData[]
  onSelect: (keyword: string) => void
  onRemoveRecent: (keyword: string) => void
  onClearRecent: () => void
}) => {
  const hasRecent = data.some((item) => item.type === 'recent')

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        {hasRecent && (
          <TouchableOpacity onPress={onClearRecent}>
            <Text className="text-primary text-sm font-semibold">
              Clear Recent
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Unified keyword list */}
      <FlatList
        data={data}
        keyExtractor={(item) => `${item.type}-${item.keyword}`}
        contentContainerClassName="gap-0 pb-2"
        renderItem={({ item }) => (
          <KeywordItem
            item={item}
            onPress={onSelect}
            onRemove={
              item.type === 'recent'
                ? () => onRemoveRecent(item.keyword)
                : undefined
            }
          />
        )}
        ListHeaderComponent={
          <Text className="text-text text-lg font-bold">Suggestions</Text>
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-12">
            <Icon name="search" size={48} />
            <Text className="text-text text-base mt-4">
              No suggestions found
            </Text>
          </View>
        }
      />
    </View>
  )
}

// ─── ProductResultList ────────────────────────────────────────────────────
const ProductResultList = ({
  products,
  isLoading,
}: {
  products: import('@/shared/types/api').ProductDto[]
  isLoading: boolean
}) => {
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#90abff" />
      </View>
    )
  }

  if (products.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <Icon name="search" size={48} />
        <Text className="text-text text-base mt-4">No products found</Text>
      </View>
    )
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      columnWrapperStyle={{ gap: 12 }}
      contentContainerClassName="pb-8 pt-2"
      ItemSeparatorComponent={() => <View className="h-3" />}
      renderItem={({ item }) => <SearchProductCard product={item} />}
    />
  )
}

// ─── SearchScreen ─────────────────────────────────────────────────────────
export const SearchScreen = () => {
  const [state, dispatch] = useReducer(searchReducer, initialSearchState)
  const { canvas } = useThemes()
  const {
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
  } = useSearchStore()

  // Fetch products for the selected keyword (only when in results phase)
  const { data: productsData, isLoading: isProductsLoading } =
    useProductsFindAll(
      {
        params: {
          query: { name: state.selectedKeyword ?? '' },
        },
      },
      { enabled: state.phase === 'results' && !!state.selectedKeyword }
    )

  const products = productsData?.data ?? []

  // Fetch all products once to extract popular keywords (only in browsing phase)
  const {
    data: allProductsData,
    isLoading: isKeywordsLoading,
    refetch,
  } = useProductsFindAll(
    { params: { query: { name: state.query } } },
    { enabled: false }
  )

  useDebouncedEffect(refetch, [state.query], { delayMs: 500 })

  // Extract unique product names as popular keywords
  const popularKeywords = useMemo(() => {
    const items = allProductsData?.data ?? []
    const names = Array.from(new Set(items.map((p) => p.name).filter(Boolean)))
    return names.slice(0, 10)
  }, [allProductsData])

  // Build unified keyword list: recent first, then popular (no duplicates)
  const keywordList = useMemo((): KeywordItemData[] => {
    const q = state.query.trim().toLowerCase()

    const filteredRecent: KeywordItemData[] = recentSearches
      .filter((s) => (q ? s.toLowerCase().includes(q) : true))
      .map((keyword) => ({ keyword, type: 'recent' as const }))

    const recentSet = new Set(
      filteredRecent.map((r) => r.keyword.toLowerCase())
    )

    const filteredPopular: KeywordItemData[] = popularKeywords
      .filter(
        (k) =>
          (q ? k.toLowerCase().includes(q) : true) &&
          !recentSet.has(k.toLowerCase())
      )
      .map((keyword) => ({ keyword, type: 'popular' as const }))

    return [...filteredRecent, ...filteredPopular]
  }, [recentSearches, popularKeywords, state.query])

  const handleSelectKeyword = useCallback(
    (keyword: string) => {
      addRecentSearch(keyword)
      dispatch({ type: 'SELECT_KEYWORD', payload: keyword })
    },
    [addRecentSearch]
  )

  const handleRemoveRecent = useCallback(
    (keyword: string) => {
      removeRecentSearch(keyword)
    },
    [removeRecentSearch]
  )

  const handleClearRecent = useCallback(() => {
    clearRecentSearches()
  }, [clearRecentSearches])

  const handleClearQuery = useCallback(() => {
    dispatch({ type: 'CLEAR_QUERY' })
  }, [])

  const handleChangeQuery = useCallback((text: string) => {
    dispatch({ type: 'SET_QUERY', payload: text })
  }, [])

  return (
    <Layout>
      <View
        className="flex-1 px-4 pt-2"
        style={{ backgroundColor: canvas.toString() }}
      >
        {/* Search Input */}
        <View className="flex-row items-center gap-3 mb-6">
          <View className="flex-1">
            <TextInput
              placeholder="Search products..."
              value={state.query}
              onChangeText={handleChangeQuery}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#7f8ab0"
              className="bg-[#0b1220] border border-[#1e293b] rounded-3xl px-5 py-4 text-text text-base shadow-sm"
            />
          </View>
          {state.query.length > 0 && (
            <TouchableOpacity
              onPress={handleClearQuery}
              className="p-2"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="close-circle" size={20} />
            </TouchableOpacity>
          )}
        </View>

        {/* Content based on phase */}
        {state.phase === 'init' ? (
          <>
            <Text className="text-text">
              Start typing to Search for products
            </Text>
          </>
        ) : state.phase === 'browsing' ? (
          isKeywordsLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#90abff" />
            </View>
          ) : (
            <KeywordList
              data={keywordList}
              onSelect={handleSelectKeyword}
              onRemoveRecent={handleRemoveRecent}
              onClearRecent={handleClearRecent}
            />
          )
        ) : state.phase === 'results' ? (
          <ProductResultList
            products={products}
            isLoading={isProductsLoading}
          />
        ) : null}
      </View>
    </Layout>
  )
}
