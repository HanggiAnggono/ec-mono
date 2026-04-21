import Card from '@/components/card'
import { Layout } from '@/layout/layout'
import { formatCurrency } from '@/module/utils'
import { useOrderFindAll } from '@/shared/query/order/use-order-find-all.query'
import { OrderStatus } from '@/shared/types/api'
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { StackScreenProp } from '.'

type OrderStatusKey = OrderStatus

const statusStyles: Record<OrderStatusKey, string> = {
  pending: 'bg-amber-500/15 text-amber-300',
  pending_payment: 'bg-amber-500/15 text-amber-300',
  payment_received: 'bg-emerald-500/15 text-emerald-300',
  order_confirmed: 'bg-sky-500/15 text-sky-300',
  failed: 'bg-rose-500/15 text-rose-300',
  expired: 'bg-zinc-500/15 text-zinc-300',
  awaiting_shipment: 'bg-cyan-500/15 text-cyan-300',
  on_hold: 'bg-orange-500/15 text-orange-300',
  awaiting_pickup: 'bg-indigo-500/15 text-indigo-300',
  completed: 'bg-violet-500/15 text-violet-300',
  cancelled: 'bg-neutral-500/15 text-neutral-300',
}

const statusLabels: Record<OrderStatusKey, string> = {
  pending: 'Pending',
  pending_payment: 'Pending Payment',
  payment_received: 'Paid',
  order_confirmed: 'Confirmed',
  failed: 'Failed',
  expired: 'Expired',
  awaiting_shipment: 'Shipping',
  on_hold: 'On Hold',
  awaiting_pickup: 'Awaiting Pickup',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const OrdersScreen: React.FC<StackScreenProp<'Orders'>> = ({
  navigation,
}) => {
  const { data, isFetching, refetch, isError } = useOrderFindAll(
    {},
    { enabled: true },
  )

  const orders = data?.data ?? []

  return (
    <Layout className="flex-1 bg-background">
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 pt-4 pb-32 gap-4"
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
        ListHeaderComponent={
          <View className="mb-2">
            <Text className="text-3xl font-black text-[#e8eeff]">Orders</Text>
            <Text className="text-sm text-[#c8d0e0] opacity-70 mt-1">
              {data
                ? `${data.totalRecords} order${data.totalRecords !== 1 ? 's' : ''}`
                : 'Loading orders...'}
            </Text>
          </View>
        }
        ListEmptyComponent={
          isFetching ? (
            <View className="flex items-center justify-center py-20">
              <ActivityIndicator size="large" />
            </View>
          ) : isError ? (
            <View className="flex items-center justify-center py-20">
              <Text className="text-[#c8d0e0] opacity-60">
                Failed to load orders. Pull to retry.
              </Text>
            </View>
          ) : (
            <View className="flex items-center justify-center py-20">
              <Text className="text-[#c8d0e0] opacity-60">
                No orders yet. Start shopping!
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const firstItem = item.orderItems?.[0]
          const extraCount = (item.orderItems?.length ?? 0) - 1
          const statusKey = (item.order_status ?? 'pending') as OrderStatusKey

          return (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('OrderDetail', {
                  orderId: item.id,
                })
              }
              activeOpacity={0.7}
            >
              <Card className="p-5 gap-3">
                {/* Top row: order info + status */}
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1 gap-1">
                    <Text className="text-[10px] font-bold tracking-widest text-primary/80">
                      ORDER #{item.id.slice(0, 8).toUpperCase()}
                    </Text>
                    <Text className="text-base font-bold text-[#e8eeff]">
                      {new Date(item.orderDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  <View
                    className={`rounded-full px-3 py-1 self-start ${statusStyles[statusKey] ?? 'bg-zinc-500/15 text-zinc-300'}`}
                  >
                    <Text className="text-[10px] font-bold tracking-wider capitalize">
                      {statusLabels[statusKey] ?? item.order_status}
                    </Text>
                  </View>
                </View>

                {/* Items preview */}
                {firstItem ? (
                  <Text
                    className="text-sm text-[#c8d0e0]"
                    numberOfLines={1}
                  >
                    {firstItem.productVariant?.product?.name ?? 'Item'}
                    {' x'}
                    {firstItem.quantity}
                    {extraCount > 0 ? `  +${extraCount} more` : ''}
                  </Text>
                ) : null}

                {/* Total */}
                <Text className="text-lg font-bold text-[#e8eeff]">
                  {formatCurrency(item.totalAmount)}
                </Text>
              </Card>
            </TouchableOpacity>
          )
        }}
      />
    </Layout>
  )
}
