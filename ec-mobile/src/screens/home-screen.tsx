import { CartContainer } from '@/containers/cart'
import { LinearGradient } from '@/components/gradient'
import { Layout } from '@/layout/layout'
import { useProductCategoryFindAll } from '@/shared/query/product-category/use-product-category-find-all.query'
import { useProductsFindAllInfinite } from '@/shared/query/products/use-products-find-all.query'
import { Product } from '@/shared/types/api'
import { Link, useFocusEffect, useNavigation } from '@react-navigation/native'
import { StackNavigationOptions } from '@react-navigation/stack'
import clsx from 'clsx'
import { useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { Button } from '@/components/button'

type TProduct = Product

const getPrice = (product: TProduct): string => {
  const price = product.variants?.[0]?.price
  return price != null ? `$${Number(price).toFixed(2)}` : '$0'
}

const imageUri = (seed: string, w = 200, h = 200) =>
  `https://loremflickr.com/${w}/${h}/${seed.split(' ').shift()}`

// ─── HeroCard ─────────────────────────────────────────────────────────────────
const HeroCard = ({ product }: { product: TProduct }) => {
  const img = imageUri(product.name, 400, 300)

  return (
    <Link screen="ProductDetail" params={{ id: product.id }}>
      <View className="rounded-[20px] overflow-hidden mb-3 ">
        <ImageBackground
          source={{ uri: img }}
          className="flex-1 aspect-square w-full"
          resizeMode="cover"
        >
          <LinearGradient
            colors={['transparent', 'rgba(6,14,32,0.82)', '#060e20']}
            style={{ padding: 30, height: '100%', width: '100%' }}
          >
            <View className="bg-primary/10 rounded-full px-3 py-1 mb-3 self-start border max-w-max border-primary/25">
              <Text className="text-primary text-[10px] font-bold tracking-widest">
                NEW ARRIVAL
              </Text>
            </View>

            <Text className="text-[#e8eeff] text-2xl font-black mb-1">
              {product.name}
            </Text>
            <Text className="text-[#c8d0e0] text-xs mb-3" numberOfLines={2}>
              {product.description}
            </Text>

            <Button variant="primary" className="mt-auto">
              {`Shop Now${product.variants?.[0]?.price ? ` — $${product.variants[0].price}` : ''}`}
            </Button>
          </LinearGradient>
        </ImageBackground>
      </View>
    </Link>
  )
}

// ─── TrendingRow ──────────────────────────────────────────────────────────────
const TrendingRow = ({ product }: { product: TProduct }) => (
  <Link screen="ProductDetail" params={{ id: product.id }} className="my-2">
    <View className="flex-row bg-[#0f1930] rounded-2xl overflow-hidden mb-2.5 h-20 items-center">
      <ImageBackground
        source={{ uri: imageUri(product.name + '-t', 800, 300) }}
        resizeMode="cover"
        style={{ width: '100%', height: '100%' }}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.99)', 'transparent', 'rgba(0,0,0,0.99)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ padding: 10, height: '100%', width: '100%' }}
        >
          <View className="flex-1 px-3.5">
            <Text className="text-[#e8eeff] font-bold text-[15px]">
              {product.name}
            </Text>
            <Text className="text-white">{product.category?.name}</Text>
            <Text className="text-[#90abff] font-semibold text-sm mt-0.5">
              {getPrice(product)}
            </Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  </Link>
)

// ─── CuratedCard ──────────────────────────────────────────────────────────────
const CuratedCard = ({
  product,
  staggered,
}: {
  product: TProduct
  staggered: boolean
}) => (
  <Link screen="ProductDetail" params={{ id: product.id }} className="w-1/2">
    <View className={clsx('p-1.5 w-full', staggered ? 'pt-6' : 'pt-1.5')}>
      <View className="bg-[#0f1930] rounded-2xl overflow-hidden">
        <View className="rounded-2xl overflow-hidden">
          <ImageBackground
            source={{ uri: imageUri(product.name + '-g', 200, 160) }}
            className="w-full aspect-square"
            resizeMode="cover"
          />
          <View className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[#0f1930]/70 items-center justify-center">
            <Text className="text-[#c8d0e0] text-base">♡</Text>
          </View>
        </View>
        <View className="p-3">
          <Text className="text-[#e8eeff] font-bold text-sm" numberOfLines={2}>
            {product.name}
          </Text>
          <Text className="text-[#c8d0e0] text-xs mt-0.5" numberOfLines={1}>
            {product.category?.name}
          </Text>
          <Text className="text-[#90abff] font-bold text-[15px] mt-1.5">
            {getPrice(product) || 0}
          </Text>
        </View>
      </View>
    </View>
  </Link>
)

// ─── HomeHeader ───────────────────────────────────────────────────────────────
type HomeHeaderProps = {
  hero: TProduct | undefined
  trending: TProduct[]
  categories: string[]
  selectedCategory: string | null
  onSelectCategory: (cat: string | null) => void
}

const HomeHeader = ({
  hero,
  trending,
  categories,
  selectedCategory,
  onSelectCategory,
}: HomeHeaderProps) => (
  <View>
    {/* Trending Now */}
    <View className="pt-2">
      <View className="flex-row justify-between items-center mb-3.5">
        <Text className="text-[#e8eeff] text-[22px] font-extrabold">
          Trending Now
        </Text>
        <Text className="text-[#90abff] text-[13px] font-semibold tracking-wide">
          VIEW ALL
        </Text>
      </View>
      {hero && <HeroCard product={hero} />}
      {trending.map((p) => (
        <TrendingRow key={p.id} product={p} />
      ))}
    </View>

    {/* Category Tabs */}
    <View className="my-4">
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(c) => c}
        contentContainerClassName="px-4"
        renderItem={({ item }) => {
          const active = item === (selectedCategory ?? 'All')
          return (
            <TouchableOpacity
              onPress={() => onSelectCategory(item === 'All' ? null : item)}
              className={clsx(
                'rounded-full px-[18px] py-2 mr-2',
                active ? 'bg-[#90abff]' : 'bg-[#141f38]'
              )}
            >
              <Text
                className={clsx(
                  'font-semibold text-[13px]',
                  active ? 'text-[#060e20]' : 'text-[#c8d0e0]'
                )}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )
        }}
      />
    </View>
  </View>
)

// ─── HomeFooter ───────────────────────────────────────────────────────────────
type HomeFooterProps = {
  isFetchingNextPage: boolean
  email: string
  onEmailChange: (v: string) => void
}

const HomeFooter = ({
  isFetchingNextPage,
  email,
  onEmailChange,
}: HomeFooterProps) => (
  <View>
    {isFetchingNextPage && (
      <ActivityIndicator size="large" color="#90abff" className="my-4" />
    )}

    {/* Newsletter */}
    <View className="mt-6 bg-[#0f1930] rounded-3xl p-6 items-center">
      <Text className="text-[#ffa7eb] text-[22px] font-extrabold text-center mb-2">
        Join the Inner Circle
      </Text>
      <Text className="text-[#c8d0e0] text-[13px] text-center mb-5">
        Get exclusive access to limited drops and 15% off your first
        neon-powered purchase.
      </Text>
      <TextInput
        placeholder="Email address"
        placeholderTextColor="#40485d"
        value={email}
        onChangeText={onEmailChange}
        keyboardType="email-address"
        autoCapitalize="none"
        className="w-full bg-[#141f38] rounded-xl px-4 py-3 text-[#e8eeff] text-sm mb-3"
      />
      <Button variant="primary" className="px-10">
        Join
      </Button>
    </View>

    <View className="h-28" />
  </View>
)

// ─── HomeScreen ───────────────────────────────────────────────────────────────
export const HomeScreen = () => {
  const {
    data,
    isLoading,
    isRefetching,
    error,
    refetch,
    fetchNextPage,
    isFetchingNextPage,
  } = useProductsFindAllInfinite()
  const { data: categoryData } = useProductCategoryFindAll()

  const products = data?.pages.flatMap((page) => page.data) || []

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [email, setEmail] = useState('')

  const { setOptions } = useNavigation()

  useFocusEffect(
    useCallback(() => {
      setOptions({
        headerRight: () => <CartContainer />,
      } as StackNavigationOptions)
    }, [])
  )

  const categories = useMemo(() => {
    const apiCats =
      (categoryData as any)
        ?.map?.((c: any) => c.name as string)
        .filter(Boolean) ?? []
    if (apiCats.length > 0) return ['All', ...apiCats]
    const fromProducts = Array.from(
      new Set(products.map((p) => p.category?.name).filter(Boolean) as string[])
    )
    return ['All', ...fromProducts]
  }, [categoryData, products])

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products
    return products.filter((p) => p.category?.name === selectedCategory)
  }, [products, selectedCategory])

  const hero = products[0]
  const trendingSide = products.slice(1, 3)

  const renderItem = useCallback(
    ({ item, index }: { item: TProduct; index: number }) => (
      <CuratedCard product={item} staggered={false} />
    ),
    []
  )

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-[#060e20]">
        <Text className="text-[#e8eeff] mb-3">Error: {String(error)}</Text>
        <Pressable
          onPress={() => refetch()}
          className="px-5 py-2.5 bg-[#90abff] rounded-full"
        >
          <Text className="text-white font-semibold">Reload</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <Layout>
      <FlatList
        key={selectedCategory ?? 'all'}
        numColumns={2}
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={
          <>
            <HomeHeader
              hero={hero}
              trending={trendingSide}
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
            <View className="my-3">
              <Text className="text-text text-3xl font-extrabold">
                Curated Essentials
              </Text>
            </View>
          </>
        }
        ListFooterComponent={
          <HomeFooter
            isFetchingNextPage={isFetchingNextPage}
            email={email}
            onEmailChange={setEmail}
          />
        }
        refreshing={isLoading || isRefetching}
        onRefresh={() => refetch()}
        onEndReachedThreshold={0.2}
        onEndReached={() => fetchNextPage()}
        contentContainerClassName="pt-24 px-4"
        showsVerticalScrollIndicator={false}
      />
    </Layout>
  )
}
