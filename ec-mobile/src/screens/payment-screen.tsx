import { Button } from '@/components/button'
import { formatCurrency } from '@/module/utils'
import { useOrderFindOne } from '@/shared/query/order/use-order-find-one.query'
import React from 'react'
import {
  ActivityIndicator,
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native'
import { StackScreenProp } from '.'
import { Layout } from '@/layout/layout'
export const PaymentScreen: React.FC<StackScreenProp<'Payment'>> = ({
  navigation,
  route,
}) => {
  const orderId = route.params?.orderId || ''
  const transactionToken = route.params?.transactionToken
  const { isFetching, data: orderDetails } = useOrderFindOne({
    params: { path: { id: orderId } },
  })

  const handlePayNow = () => {
    if (transactionToken) {
      Linking.openURL(
        `https://app.sandbox.midtrans.com/snap/v4/redirection/${transactionToken}`
      )
    }
  }

  const handleBackToHome = () => {
    navigation.navigate('HomeTab')
  }

  if (!orderDetails && !isFetching) {
    return (
      <View>
        <Text className="text-text">Order not found, please create again</Text>
      </View>
    )
  }

  return (
    <Layout>
      <SafeAreaView className="flex-1">
        <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

        {!orderDetails ? null : isFetching ? (
          <ActivityIndicator className="flex-1 flex self-center justify-self-center" />
        ) : (
          <>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {/* Header Section */}
              <View className="bg-background px-4 py-6 border-b border-gray-200">
                <Text className="text-2xl font-bold text-text mb-2">
                  Order Confirmation
                </Text>
                <Text className="text-lg font-semibold text-text mb-1">
                  #{orderDetails?.id}
                </Text>
                <Text className="text-base text-text">
                  Order Date:{' '}
                  {new Date(orderDetails?.orderDate)?.toLocaleString()}
                </Text>
                <View className="mt-3 px-3 py-1 bg-yellow-100 rounded-full self-start">
                  <Text className="font-medium text-sm text-surface">
                    {orderDetails?.order_status}
                  </Text>
                </View>
              </View>

              {/* Order Items */}
              <View className="bg-background mt-2 px-4 py-4">
                <Text className="text-lg font-semibold text-text mb-4">
                  Order Items ({orderDetails?.orderItems?.length})
                </Text>

                {orderDetails?.orderItems?.map((item, index) => (
                  <View key={item.id} className="mb-4">
                    <View className="flex-row">
                      <Image
                        source={{
                          uri: `https://picsum.photos/140/140?random=${orderId}`,
                        }}
                        className="w-16 h-16 rounded-lg mr-3"
                        resizeMode="cover"
                      />
                      <View className="flex-1">
                        <Text className="font-semibold text-text mb-1">
                          {item?.productVariant?.product?.name}
                        </Text>
                        <Text className="text-sm text-text">
                          {item.productVariant?.name}
                        </Text>
                        <Text className="text-sm text-text">
                          Qty: {item.quantity}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="font-semibold text-text">
                          {formatCurrency(item.price)}
                        </Text>
                      </View>
                    </View>
                    {index < orderDetails.orderItems?.length - 1 && (
                      <View className="border-b border-gray-100 mt-4" />
                    )}
                  </View>
                ))}
              </View>

              {/* Order Summary */}
              <View className="bg-background mt-2 px-4 py-4">
                <Text className="text-lg font-semibold text-text mb-4">
                  Order Summary
                </Text>

                <View className="space-y-2">
                  <View className="flex-row justify-between">
                    <Text className="text-text">Subtotal</Text>
                    <Text className="text-text">
                      {formatCurrency(orderDetails.totalAmount - 10)}
                    </Text>
                  </View>
                  {/* <View className="flex-row justify-between">
              <Text className="text-text">Shipping</Text>
              <Text className="text-text">10.00</Text>
            </View> */}
                  <View className="flex-row justify-between">
                    <Text className="text-text">Tax</Text>
                    <Text className="text-text">0.00</Text>
                  </View>
                  <View className="border-t border-gray-200 pt-2 mt-2">
                    <View className="flex-row justify-between">
                      <Text className="text-lg font-semibold text-text">
                        Total
                      </Text>
                      <Text className="text-lg font-semibold text-text">
                        {formatCurrency(orderDetails.totalAmount)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Payment Method */}
              <View className="bg-background mt-2 px-4 py-4">
                <Text className="text-lg font-semibold text-text mb-4">
                  Payment Method
                </Text>
                <View className="flex-row items-center">
                  <View className="w-10 h-6 bg-blue-600 rounded mr-3 flex items-center justify-center">
                    <Text className="text-xs font-bold text-text">VISA</Text>
                  </View>
                  <Text className="text-text">
                    {orderDetails.payment?.[0]?.payment_method}
                  </Text>
                </View>
              </View>

              {/* Shipping Address */}
              {/* <View className="bg-background mt-2 px-4 py-4 mb-6">
          <Text className="text-lg font-semibold text-text mb-4">
            Shipping Address
          </Text>
          <Text className="text-text font-medium">
            {orderDetails.shippingAddress.name}
          </Text>
          <Text className="text-text mt-1">
            {orderDetails.shippingAddress.street}
          </Text>
          <Text className="text-text">
            {orderDetails.shippingAddress.city},{' '}
            {orderDetails.shippingAddress.state}{' '}
            {orderDetails.shippingAddress.zipCode}
          </Text>
          <Text className="text-text">
            {orderDetails.shippingAddress.country}
          </Text>
        </View> */}
            </ScrollView>

            {/* Bottom Action Buttons */}
            <View className="bg-background px-4 py-6 border-t border-gray-200 gap-y-3 flex flex-row justify-between">
              <Button onPress={handleBackToHome}>Back to Home</Button>
              <Button
                onPress={handlePayNow}
                icon="arrow-right"
                variant="primary"
              >
                Pay Now - {formatCurrency(orderDetails.totalAmount)}
              </Button>
            </View>
          </>
        )}
      </SafeAreaView>
    </Layout>
  )
}
