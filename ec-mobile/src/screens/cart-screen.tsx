import { Button } from '@/components/button'
import { useGetCart } from '@/module/cart/usecases/use-get-cart'
import { useCartRemoveCartItem } from '@/shared/query/cart/use-cart-remove-cart-item.mutation'
import { useCartUpdateCartItem } from '@/shared/query/cart/use-cart-update-cart-item.mutation'
import { CartItem } from '@/shared/types/api'
import { Alert, FlatList, Image, Pressable, Text, View } from 'react-native'
import { Routes, StackScreenProp } from '.'
import { Layout } from '@/layout/layout'
import Card from '@/components/card'
import { useDebouncedEffect } from '@/shared/hooks/use-debounced-effect'
import { useEffect, useState } from 'react'

export const CartScreen = (props: StackScreenProp<'Cart'>) => {
  const { data: cart, refetch } = useGetCart()
  const { mutateAsync: removeCartItem, isPending: isRemoving } =
    useCartRemoveCartItem()
  const { mutateAsync: updateCartItem, isPending: isUpdating } =
    useCartUpdateCartItem()
  const [resetTokens, setResetTokens] = useState<Record<string, number>>({})

  const items = cart?.items || []

  function handleCheckout() {
    if (!cart) return

    props.navigation.navigate(Routes.Checkout)
  }

  async function handleUpdateQuantity(item: CartItem, nextQuantity: number) {
    if (nextQuantity < 1) return

    try {
      await updateCartItem({
        params: { path: { id: String(item.id) } },
        body: { quantity: nextQuantity },
      })

      refetch()
    } catch (error) {
      const message = JSON.stringify(error).toLowerCase()
      const isStockError =
        message.includes('stock') &&
        (message.includes('not enough') || message.includes('insufficient'))

      if (isStockError) {
        setResetTokens((prev) => ({
          ...prev,
          [String(item.id)]: (prev[String(item.id)] || 0) + 1,
        }))
        Alert.alert('Not enough stock')
      }
    }
  }

  async function handleRemoveItem(item: CartItem) {
    await removeCartItem({
      params: { path: { id: String(item.id) } },
    })

    refetch()
  }

  function renderItem({ item }: { item: CartItem }) {
    return (
      <Card className="m-2 p-4 rounded-lg shadow">
        <View className="flex-row">
          <Pressable
            className="flex-row flex-1"
            onPress={() => {
              return props.navigation.navigate(Routes.ProductDetail, {
                id: item.productVariant.product.id.toString(),
                variantId: item.productVariant.id.toString(),
              })
            }}
          >
            <Image
              source={{
                uri: `https://picsum.photos/140/140?random=${item.productVariant.product.name}`,
              }}
              className="w-16 h-16 mr-4 rounded"
              resizeMode="cover"
            />
            <View className="flex-1">
              <Text className="font-bold text-text">
                {item.productVariant.product.name}
              </Text>
              <Text className="text-text">{item.productVariant.name}</Text>
            </View>
          </Pressable>
          <View className="items-end">
            <Text className="font-bold text-text">Price: {item.price}</Text>
            <View className="flex-row items-end">
              <Button
                className="mt-2"
                icon="delete"
                onPress={() => handleRemoveItem(item)}
                disabled={isRemoving}
              />
              <QuantityStepper
                value={item.quantity}
                min={1}
                disabled={isUpdating}
                resetToken={resetTokens[String(item.id)] || 0}
                onDebouncedChange={(nextQuantity) =>
                  handleUpdateQuantity(item, nextQuantity)
                }
              />
            </View>
          </View>
        </View>
      </Card>
    )
  }

  return (
    <Layout>
      {items.length ? (
        <>
          <FlatList data={items} renderItem={renderItem} className="h-full" />
          <View className="absolute w-full bottom-0 bg-background p-safe-or-5">
            <Button
              icon="arrow-right"
              onPress={handleCheckout}
              className="ml-auto"
            >
              Chekcout
            </Button>
          </View>
        </>
      ) : (
        <View className="h-full bg-background items-center justify-center">
          <Text className="text-text">
            There's nothing, go back and add some items
          </Text>
        </View>
      )}
    </Layout>
  )
}

type QuantityStepperProps = {
  value: number
  min?: number
  disabled?: boolean
  resetToken?: number
  onDebouncedChange: (nextValue: number) => void
}

const QuantityStepper = ({
  value,
  min = 1,
  disabled = false,
  resetToken = 0,
  onDebouncedChange,
}: QuantityStepperProps) => {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    setLocalValue(value)
  }, [resetToken, value])

  useDebouncedEffect(
    () => {
      if (localValue !== value) {
        onDebouncedChange(localValue)
      }
    },
    [localValue, value],
    { delayMs: 400 }
  )

  return (
    <View className="flex-row items-center gap-2 mt-2">
      <Button
        className="px-2"
        onPress={() => setLocalValue(Math.max(min, localValue - 1))}
        disabled={disabled || localValue <= min}
      >
        -
      </Button>
      <Text className="text-text">{localValue}</Text>
      <Button
        className="px-2"
        onPress={() => setLocalValue(localValue + 1)}
        disabled={disabled}
      >
        +
      </Button>
    </View>
  )
}
