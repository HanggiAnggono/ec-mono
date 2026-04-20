import Card from '@/components/card'
import { Layout } from '@/layout/layout'
import { formatCurrency } from '@/module/utils'
import { OrderDto } from '@/shared/types/api'
import { FlatList, Text, View } from 'react-native'

type MockOrder = Pick<
  OrderDto,
  'id' | 'orderDate' | 'order_status' | 'totalAmount'
>

const mockOrders: MockOrder[] = [
  {
    id: 'codex-order-001',
    orderDate: '2026-04-19T08:15:00.000Z',
    order_status: 'pending_payment',
    totalAmount: 125000,
  },
  {
    id: 'codex-order-002',
    orderDate: '2026-04-18T13:40:00.000Z',
    order_status: 'payment_received',
    totalAmount: 289000,
  },
  {
    id: 'codex-order-003',
    orderDate: '2026-04-17T17:05:00.000Z',
    order_status: 'order_confirmed',
    totalAmount: 76000,
  },
  {
    id: 'codex-order-004',
    orderDate: '2026-04-16T09:10:00.000Z',
    order_status: 'cancelled',
    totalAmount: 94000,
  },
]

const statusStyles: Record<MockOrder['order_status'], string> = {
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

export const OrdersScreen = () => {
  return (
    <Layout className="flex-1 bg-background">
      <FlatList
        data={mockOrders}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 pt-4 pb-32 gap-3"
        ListHeaderComponent={
          <View className="mb-2">
            <Text className="text-3xl font-black text-text">Orders</Text>
            <Text className="text-sm text-text opacity-70 mt-1">
              Mock tab list built from the current order schema only.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card className="p-4 border border-background-200">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1">
                <Text className="text-xs text-text opacity-60">
                  Order {item.id}
                </Text>
                <Text className="text-lg font-bold text-text mt-1">
                  {new Date(item.orderDate).toLocaleDateString()}
                </Text>
                <Text className="text-sm text-text opacity-70 mt-1">
                  {item.order_status.replace(/_/g, ' ')}
                </Text>
              </View>
              <View
                className={`rounded-full px-3 py-1 self-start ${statusStyles[item.order_status]}`}
              >
                <Text className="text-xs font-semibold capitalize">
                  {item.order_status.replace(/_/g, ' ')}
                </Text>
              </View>
            </View>

            <View className="mt-4 flex-row items-end justify-between border-t border-background-200 pt-3">
              <View>
                <Text className="text-xs text-text opacity-60">
                  Total Amount
                </Text>
                <Text className="text-base font-semibold text-text mt-1">
                  {formatCurrency(item.totalAmount)}
                </Text>
              </View>
              <Text className="text-xs text-text opacity-60">
                No backend fetch on this screen
              </Text>
            </View>
          </Card>
        )}
      />
    </Layout>
  )
}
