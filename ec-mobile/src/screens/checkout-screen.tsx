import { Button } from '@/components/button'
import { useGetCart } from '@/module/cart/usecases/use-get-cart'
import { useCartCheckoutCart } from '@/shared/query/cart/use-cart-checkout-cart.mutation'
import { useCartCompleteCheckout } from '@/shared/query/cart/use-cart-complete-checkout.mutation'
import { CartItem } from '@/shared/types/api'
import React, { useEffect, useState } from 'react'
import {
  FlatList,
  Text,
  View,
  Image,
  ActivityIndicator,
  Switch,
  Alert,
} from 'react-native'
import { StackScreenProp } from '.'
import { Layout } from '@/layout/layout'
import clsx from 'clsx'
import Icon from '@/components/icon'
import { LinearGradient } from '@/components/gradient'

export const CheckoutScreen: React.FC<StackScreenProp<'Checkout'>> = ({
  navigation,
}) => {
  const { data: cart } = useGetCart()
  const {
    mutateAsync: checkout,
    data: checkoutData,
    isPending,
  } = useCartCheckoutCart()
  const {
    mutateAsync: complete,
    data,
    isPending: isCompleting,
  } = useCartCompleteCheckout()
  const [payment, setPayment] = useState('')

  useEffect(() => {
    if (cart?.sessionId) {
      checkout({ params: { path: { sessionId: cart.sessionId } } })
    }
  }, [cart?.sessionId])

  const items = checkoutData?.items || []
  const payments = checkoutData?.paymentMethods || []

  function handlePurchase() {
    if (!cart) return
    complete({
      body: { paymentMethod: payment },
      params: { path: { sessionId: cart?.sessionId } },
    }).then((resp) => {
      navigation.navigate('Payment', { orderId: resp.orderId, transactionToken: resp.transactionToken })
    })
  }

  function renderItem({ item }: { item: CartItem }) {
    return (
      <View className="bg-background m-2 p-4 rounded-lg shadow">
        <View className="flex-row">
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
          <View className="items-end">
            <Text className="font-bold text-text">Price: {item.price}</Text>
            <Text className="text-text">Quantity: {item.quantity}</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <Layout className="relative h-full">
      {isPending ? (
        <View className="flex flex-1 justify-center items-center">
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            renderItem={renderItem}
            ListFooterComponent={() => {
              return (
                <View className="bg-background mt-2 py-4">
                  <Text className="text-xl text-text mb-4 px-4">
                    Payment Method
                  </Text>
                  <FlatList
                    data={payments}
                    ItemSeparatorComponent={() => (
                      <View className="border-[0.5px] border-background-200 opacity-20" />
                    )}
                    renderItem={({ item: method, separators }) => {
                      const selected = method == payment
                      return (
                        <View
                          key={method}
                          onTouchEnd={() => setPayment(method)}
                          className="flex flex-row justify-between items-center p-4"
                        >
                          <Text
                            className={clsx(
                              selected ? 'text-surface' : 'text-text',
                              'z-20'
                            )}
                          >
                            {method}
                          </Text>
                          {selected ? (
                            <LinearGradient
                              colors={[
                                'rgb(0,100,0)',
                                'rgba(45, 210, 45, 0.773)',
                                'rgba(96, 201, 96, 0.521)',
                                'rgba(255, 255, 255, 0)',
                              ]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              locations={[0, 0.4, 0.6, 1]}
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                              }}
                            ></LinearGradient>
                          ) : null}
                          {selected ? (
                            <Icon
                              className="absolute right-0"
                              name="check"
                              size={20}
                            />
                          ) : null}
                        </View>
                      )
                    }}
                  />
                </View>
              )
            }}
          ></FlatList>
          <View className="absolute w-full bottom-0 bg-background p-safe-or-5">
            <Button
              icon="arrow-right"
              disabled={isCompleting}
              onPress={handlePurchase}
              className="ml-auto"
            >
              Purchase
            </Button>
          </View>
        </>
      )}
    </Layout>
  )
}
