import Card from '@/components/card'
import { Layout } from '@/layout/layout'
import { formatCurrency } from '@/module/utils'
import { useOrderFindOne } from '@/shared/query/order/use-order-find-one.query'
import { OrderStatus } from '@/shared/types/api'
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { StackScreenProp, Routes } from '.'

type OrderStatusKey = OrderStatus

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

export const OrderDetailScreen: React.FC<StackScreenProp<'OrderDetail'>> = ({
  navigation,
  route,
}) => {
  const orderId = route.params.orderId
  const { data: order, isFetching } = useOrderFindOne(
    { params: { path: { id: orderId } } },
    { enabled: !!orderId }
  )

  if (!order && !isFetching) {
    return (
      <Layout className="flex-1 items-center justify-center">
        <Text className="text-[#c8d0e0]">Order not found.</Text>
      </Layout>
    )
  }

  if (!order) {
    return (
      <Layout className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </Layout>
    )
  }

  const statusKey = (order.order_status ?? 'pending') as OrderStatusKey
  const needsPayment =
    order.order_status === 'pending_payment' || order.order_status === 'pending'

  return (
    <Layout className="flex-1 bg-background">
      <FlatList
        data={order.orderItems ?? []}
        keyExtractor={(item, idx) => String(item.id ?? idx)}
        contentContainerClassName="px-4 pt-4 pb-40 gap-4"
        ListHeaderComponent={
          <View className="gap-4 mb-2">
            {/* Order Header Card */}
            <Card className="p-5 gap-3">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 gap-1">
                  <Text className="text-[10px] font-bold tracking-widest text-primary/80">
                    ORDER #{order.id.slice(0, 8).toUpperCase()}
                  </Text>
                  <Text className="text-xl font-black text-[#e8eeff]">
                    {new Date(order.orderDate).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <View
                  className={`rounded-full px-3 py-1.5 self-start ${statusStyles[statusKey] ?? 'bg-zinc-500/15 text-zinc-300'}`}
                >
                  <Text className="text-[10px] font-bold tracking-wider">
                    {statusLabels[statusKey] ?? order.order_status}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Section label */}
            <Text className="text-[10px] font-bold tracking-widest text-primary/60">
              ITEMS ({order.orderItems?.length ?? 0})
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card className="p-4">
            <View className="flex-row justify-between items-start gap-3">
              <View className="flex-1 gap-1">
                <Text className="text-base font-bold text-[#e8eeff]">
                  {item.productVariant?.product?.name ?? 'Item'}
                </Text>
                {item.productVariant?.name &&
                item.productVariant.name !==
                  item.productVariant?.product?.name ? (
                  <Text className="text-xs text-[#c8d0e0] opacity-60">
                    {item.productVariant.name}
                  </Text>
                ) : null}
                <Text className="text-xs text-primary/70 mt-1">
                  {formatCurrency(item.price)} each
                </Text>
              </View>
              <View className="items-end gap-1">
                <Text className="text-base font-bold text-[#e8eeff]">
                  {formatCurrency(item.price * item.quantity)}
                </Text>
                <Text className="text-xs text-[#c8d0e0] opacity-60">
                  x{item.quantity}
                </Text>
              </View>
            </View>
          </Card>
        )}
        ListFooterComponent={
          <View className="gap-4 mt-2">
            {/* Total Card */}
            <Card className="p-5">
              <View className="flex-row justify-between items-center">
                <Text className="text-lg font-black text-[#e8eeff]">Total</Text>
                <Text className="text-lg font-black text-[#e8eeff]">
                  {formatCurrency(order.totalAmount)}
                </Text>
              </View>
            </Card>

            {/* Go to Payment */}
            {needsPayment ? (
              <TouchableOpacity
                className="rounded-full py-4 px-6 items-center"
                style={{
                  backgroundColor: '#90abff',
                  experimental_backgroundImage: 'linear-gradient(135deg, #90abff, #316bf3)',
                }}
                onPress={() =>
                  navigation.navigate(Routes.Payment, {
                    orderId: order.id,
                    transactionToken: order.payment?.transaction_id,
                  })
                }
                activeOpacity={0.7}
              >
                <Text className="text-[#060e20] font-bold text-base tracking-wide">
                  Go to Payment
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        }
      />
    </Layout>
  )
}
