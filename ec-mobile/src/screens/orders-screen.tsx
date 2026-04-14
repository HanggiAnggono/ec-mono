import { useOrderFindAll } from '@/shared/query/order/use-order-find-all.query'
import {
  ActivityIndicator,
  Image,
  ListRenderItemInfo,
  Text,
  View,
  FlatList,
  Pressable,
} from 'react-native'
import { Separator } from '@/components/separator'
import { formatCurrency } from '@/module/utils'
import { Layout } from '@/layout/layout'
import Card from '@/components/card'
import { StackScreenProp } from '.'

export const OrdersScreen = (props: StackScreenProp<'Orders'>) => {
  // TODO: handle filters and paging
  const { data, isPending, isRefetching, refetch } = useOrderFindAll()
  const orders = data?.data || []

  function handlePressOrder(orderId: number) {
    props.navigation.navigate('Payment', { orderId: orderId.toString() })
  }

  function renderItem(item: ListRenderItemInfo<(typeof orders)[0]>) {
    const order = item.item
    return (
      <Pressable onPress={() => handlePressOrder(order.id)}>
        <Card className="grid p-3 rounded-md border border-gray-400 active:bg-background-700">
          <View className="flex flex-row justify-between">
            <View>
              <Text className="text-text">#{order.id}</Text>
              <Text className="text-sm text-text">
                {new Date(order.orderDate).toLocaleDateString()}
              </Text>
            </View>
            <Text className="text-text">
              {order.order_status?.replace(/_/g, ' ')}
            </Text>
          </View>
          <View>
            {order.orderItems?.map((item) => {
              return (
                <View
                  className="flex flex-row items-start gap-3 my-2"
                  key={item.id}
                >
                  <Image
                    className="rounded-md size-14"
                    source={{
                      uri: `https://picsum.photos/140/140?random=${item.id}`,
                    }}
                  />
                  <View className="text-text">
                    <Text className="text-text">
                      {item.productVariant?.product?.name}
                    </Text>
                    <Text className="text-sm text-text">
                      {item.productVariant?.name}
                    </Text>
                  </View>
                </View>
              )
            })}
          </View>
          <View className="mt-4 border-t border-t-gray-300 py-2 ">
            <Text className="text-text">Total Amount</Text>
            <Text className="text-text">
              {formatCurrency(order.totalAmount)}
            </Text>
          </View>
        </Card>
      </Pressable>
    )
  }

  return (
    <Layout className="flex-1">
      {isPending ? (
        <ActivityIndicator
          className="self-center justify-self-center"
          size="large"
        />
      ) : (
        <FlatList
          data={orders}
          renderItem={renderItem}
          contentContainerClassName="pb-32 pt-5 px-3"
          refreshing={isRefetching}
          onRefresh={refetch}
          ItemSeparatorComponent={Separator}
        />
      )}
    </Layout>
  )
}
