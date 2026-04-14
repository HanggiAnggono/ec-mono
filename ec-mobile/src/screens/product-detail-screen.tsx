import { BottomSheet } from '@/components/bottom-sheet'
import { Button } from '@/components/button'
import { Layout } from '@/layout/layout'
import { formatCurrency } from '@/module/utils'
import { useGetCart } from '@/module/cart/usecases/use-get-cart'
import { useCartAddToCart } from '@/shared/query/cart/use-cart-add-to-cart.mutation'
import { useCartUpdateCartItem } from '@/shared/query/cart/use-cart-update-cart-item.mutation'
import { useProductsFindOne } from '@/shared/query/products/use-products-find-one.query'
import { useCart } from '@/store/cart.store'
import { useNavigation, useRoute } from '@react-navigation/native'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import {
  Alert,
  FlatList,
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { StackScreenProp } from '.'

export const ProductDetailPage = (props: StackScreenProp<'ProductDetail'>) => {
  const navigation = useNavigation()
  const { id = '', variantId: initialVariantId } = props.route.params || {}
  const { data, isLoading } = useProductsFindOne({ params: { path: { id } } })
  const [isOpen, setIsOpen] = useState(false)
  const { cartSessionId, setCartSessionId } = useCart()
  const { data: cart, refetch: refetchCart } = useGetCart()
  const { mutateAsync: addToCart, isPending, error } = useCartAddToCart()
  const { mutateAsync: updateCartItem, isPending: isUpdating } =
    useCartUpdateCartItem()

  const variants = data?.variants || []
  const [variantId, setVariantId] = useState<number>(Number(initialVariantId))
  const [quantity, setQuantity] = useState(0)
  const selectedVariant = variants?.find((v) => v.id === variantId)
  const existingCartItem = cart?.items?.find(
    (item) => item.productVariant.id === variantId
  )

  useEffect(() => {
    if (existingCartItem) {
      setVariantId(existingCartItem.productVariantId)
      setQuantity(existingCartItem.quantity)
    } else if (!initialVariantId && variants?.length) {
      setVariantId(variants[0].id)
    }
    navigation.setOptions({ title: data?.name })
  }, [variants, existingCartItem])

  function handleAddToCart() {
    setIsOpen(true)
  }

  async function handleSubmit() {
    try {
      if (existingCartItem) {
        await updateCartItem({
          params: { path: { id: String(existingCartItem.id) } },
          body: { quantity: quantity },
        })
        refetchCart()
      } else {
        await addToCart({
          body: {
            productVariantId: variantId,
            quantity,
            sessionId: cartSessionId || '',
          },
        }).then((res) => {
          setCartSessionId(res.sessionId)
        })
      }
      Alert.alert('Added to cart', 'Would you like to view your cart now?', [
        {
          text: 'Go to Cart',
          onPress: () => navigation.navigate('Cart' as never),
        },
        {
          text: 'OK',
          style: 'cancel',
        },
      ])
    } catch (error) {
      Alert.alert('Failed to add to cart', JSON.stringify(error))
    }
  }

  const handleChangeVariant =
    (item: NonNullable<typeof data>['variants'][0]) => (e) => {
      setVariantId(item.id)
      if (item.id === existingCartItem?.productVariantId) {
        setQuantity(existingCartItem.quantity)
      } else {
        setQuantity(1)
      }
    }

  // data?.variants?.[0]
  const renderVariants = ({
    item,
  }: {
    item: NonNullable<typeof data>['variants'][0]
  }) => {
    const selected = variantId === item.id

    return (
      <Pressable
        className={clsx(
          'rounded-full p-2 px-4 self-start mr-2',
          selected ? 'bg-primary' : 'bg-slate-500'
        )}
        onPress={handleChangeVariant(item)}
      >
        <Text className={clsx('text-sm text-surface')}>{item.name}</Text>
      </Pressable>
    )
  }

  return (
    <Layout className="flex flex-1 bg-background">
      <ScrollView contentContainerClassName="pb-24">
        <ImageBackground
          source={{ uri: `https://picsum.photos/140/140?random=${data?.name}` }}
          className="w-full h-96 bg-surface"
        />
        <View className="p-4">
          <Text className="p-4 text-2xl text-text mb-3">{data?.name}</Text>
          {data?.category ? (
            <View className="rounded-full p-2 bg-primary self-start mb-5">
              <Text className="text-surface text-sm ">
                {data?.category?.name}
              </Text>
            </View>
          ) : null}
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={variants}
            renderItem={renderVariants}
            className="my-5 -mx-4 px-4"
          />
          <Text className="text-lg text-text">{data?.description}</Text>
        </View>
      </ScrollView>

      <View className="absolute bottom-safe-or-20 right-safe-or-5 p-3  bg-background border border-primary rounded-full">
        <View className="flex flex-row justify-end gap-1">
          <Button icon="message" className="flex items-center justify-center">
            Chat
          </Button>
          <Button onPress={handleAddToCart}>
            {existingCartItem ? 'Update Cart' : 'Add to Cart'}
          </Button>
        </View>
      </View>

      <BottomSheet isOpen={isOpen} setIsOpen={setIsOpen}>
        <View className="p-2">
          <View className="flex-row gap-2">
            <ImageBackground
              source={{ uri: 'https://picsum.photos/400/400' }}
              className="size-40 bg-surface rounded-xl overflow-hidden mb-5"
            />
            <View>
              <Text className="text-2xl text-text mb-3">
                {selectedVariant?.name}
              </Text>
              <Text className="text-text mb-3">
                {formatCurrency(selectedVariant?.price)}
              </Text>
              <Text className="text-text mb-3">
                {selectedVariant?.stock_quantity} Available
              </Text>
            </View>
          </View>
          <View className="flex flex-wrap flex-row gap-4 mb-10">
            {variants.map((v) => {
              return <View key={v.id}>{renderVariants({ item: v })}</View>
            })}
          </View>
          <View className="flex-row items-center mb-10 gap-4">
            <Text className="text-lg text-text ml-auto">Quantity</Text>
            <Button
              onPress={() => setQuantity(quantity - 1)}
              disabled={quantity <= 1}
            >
              {' '}
              -{' '}
            </Button>
            <Text className="text-text">{quantity}</Text>
            <Button onPress={() => setQuantity(quantity + 1)}> + </Button>
          </View>
          <Button
            className="self-end"
            icon="shopping-cart"
            onPress={handleSubmit}
            disabled={isPending || isUpdating}
          >
            {existingCartItem ? 'Update Cart' : 'Add to Cart'}
          </Button>
        </View>
      </BottomSheet>
    </Layout>
  )
}
