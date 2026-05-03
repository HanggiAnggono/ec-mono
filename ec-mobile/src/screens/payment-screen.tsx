import { Button } from '@/components/button'
import { Layout } from '@/layout/layout'
import { formatCurrency } from '@/module/utils'
import { useOrderFindOne } from '@/shared/query/order/use-order-find-one.query'
import { usePaymentSyncPayment } from '@/shared/query/payment/use-payment-sync-payment.query'
import React, { useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Linking,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { WebView } from 'react-native-webview'
import { StackScreenProp } from '.'

const TERMINAL_STATUSES = ['payment_received', 'failed', 'expired', 'cancelled']

export const PaymentScreen: React.FC<StackScreenProp<'Payment'>> = ({
  navigation,
  route,
}) => {
  const orderId = route.params?.orderId || ''
  const transactionToken = route.params?.transactionToken
  const redirectUrl = route.params?.redirectUrl
  const [showWebView, setShowWebView] = useState(true)
  const [lastVisitedUrl, setLastVisitedUrl] = useState<string>()
  const {
    isFetching,
    data: orderDetails,
    refetch,
  } = useOrderFindOne(
    {
      params: { path: { id: orderId } },
    },
    {
      enabled: !!orderId,
    }
  )
  const { refetch: syncPayment, isFetching: isSyncing } = usePaymentSyncPayment(
    { params: { path: { orderId } } },
    { enabled: false }
  )

  const webView = useRef<WebView>(null)

  const paymentUrl = orderDetails?.payment?.payment_url

  const currentPayment = orderDetails?.payment
  const hasTerminalStatus = orderDetails
    ? TERMINAL_STATUSES.includes(orderDetails.order_status)
    : false

  const handleBackToHome = () => {
    navigation.navigate('HomeTab')
  }

  const handleSyncStatus = async () => {
    if (!orderId) return

    await syncPayment()
    const refreshed = await refetch()

    if (
      refreshed.data &&
      TERMINAL_STATUSES.includes(refreshed.data.order_status)
    ) {
      setShowWebView(false)
    }
  }

  if (!orderDetails && !isFetching) {
    return (
      <Layout className="flex-1 items-center justify-center">
        <Text className="text-text">Order not found, please create again.</Text>
      </Layout>
    )
  }

  return (
    <Layout className="flex-1">
      <SafeAreaView className="flex-1">
        {!orderDetails ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <ScrollView>
            <View className="px-4 py-4 border-b border-background-200 bg-background rounded-md m-2 gap-2">
              <Text className="text-2xl font-bold text-text">
                Complete Payment
              </Text>
              <Text className="text-text opacity-70">
                Order #{orderDetails.id}
              </Text>
              <View className="flex-row items-center gap-2 mt-1">
                <View
                  className={`rounded-full px-3 py-1 ${
                    orderDetails.order_status === 'pending_payment'
                      ? 'bg-amber-500/15'
                      : orderDetails.order_status === 'payment_received'
                        ? 'bg-emerald-500/15'
                        : orderDetails.order_status === 'cancelled'
                          ? 'bg-neutral-500/15'
                          : 'bg-zinc-500/15'
                  }`}
                >
                  <Text className="text-xs font-semibold capitalize text-text">
                    {orderDetails.order_status.replaceAll('_', ' ')}
                  </Text>
                </View>
                {currentPayment ? (
                  <Text className="text-xs text-text opacity-60">
                    Midtrans: {currentPayment.transaction_status}
                  </Text>
                ) : null}
              </View>
            </View>

            {paymentUrl && showWebView && !hasTerminalStatus ? (
              <WebView
                ref={webView}
                source={{ uri: paymentUrl }}
                className="flex-1 h-10"
                nestedScrollEnabled
                style={{ height: 600, minHeight: 600 }}
                allowsBackForwardNavigationGestures={true}
                cacheEnabled={false}
                javaScriptEnabled
                domStorageEnabled
                startInLoadingState
                renderLoading={() => (
                  <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" />
                  </View>
                )}
                onShouldStartLoadWithRequest={(request) => {
                  setLastVisitedUrl(request.url)

                  if (!request.url.startsWith('http')) {
                    Linking.openURL(request.url)
                    return false
                  }

                  return true
                }}
                onNavigationStateChange={(navState) => {
                  setLastVisitedUrl(navState.url)

                  if (
                    navState.url.includes('finish') ||
                    navState.url.includes('unfinish') ||
                    navState.url.includes('error') ||
                    navState.url.includes('status_code=')
                  ) {
                    setShowWebView(false)
                    handleSyncStatus().catch(console.error)
                  }
                }}
              />
            ) : (
              <View className="flex-1 items-center justify-center px-6 min-h-[10rem] bg-background m-2 rounded-md">
                <Text className="text-center text-text">
                  {hasTerminalStatus
                    ? 'Payment is already finalized.'
                    : 'Open the Midtrans payment page, complete the payment, then check the latest status here.'}
                </Text>
              </View>
            )}

            {/* Order Items */}
            {orderDetails?.orderItems?.length > 0 ? (
              <View className="px-4 py-3 border-b border-background-200 bg-background m-2 rounded-md gap-2">
                <Text className="text-sm font-semibold text-text opacity-80">
                  Items
                </Text>
                {orderDetails.orderItems.map((item, idx) => (
                  <View
                    key={item.id || idx}
                    className="flex-row justify-between items-start py-2"
                  >
                    <View className="flex-1">
                      <Text className="text-text font-medium">
                        {item.productVariant?.product?.name ?? 'Item'}
                      </Text>
                      {item.productVariant?.name &&
                      item.productVariant.name !==
                        item.productVariant?.product?.name ? (
                        <Text className="text-xs text-text opacity-60 mt-0.5">
                          {item.productVariant.name}
                        </Text>
                      ) : null}
                    </View>
                    <View className="items-end">
                      <Text className="text-text font-medium">
                        {formatCurrency(item.price)}
                      </Text>
                      <Text className="text-xs text-text opacity-60">
                        x{item.quantity}
                      </Text>
                    </View>
                  </View>
                ))}
                <View className="flex-row justify-between pt-2 border-t border-background-200">
                  <Text className="text-text font-bold">Total</Text>
                  <Text className="text-text font-bold">
                    {formatCurrency(orderDetails.totalAmount)}
                  </Text>
                </View>
              </View>
            ) : null}

            <View className="px-4 py-4 border-t border-background-200 bg-background m-2 rounded-md gap-3">
              <View className="flex-row flex-wrap gap-3">
                <Button
                  onPress={() => handleSyncStatus().catch(console.error)}
                  disabled={isSyncing || isFetching}
                >
                  {isSyncing ? 'Checking...' : 'Check Payment Status'}
                </Button>
                {paymentUrl ? (
                  <Button
                    onPress={() => {
                      webView.current?.reload()
                    }}
                    variant="ghost"
                    disabled={isSyncing}
                  >
                    Reopen Payment Page
                  </Button>
                ) : null}
                <Button onPress={handleBackToHome} variant="ghost">
                  Back to Home
                </Button>
              </View>

              {lastVisitedUrl ? (
                <Text className="text-xs text-text opacity-60">
                  Last page: {lastVisitedUrl}
                </Text>
              ) : null}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Layout>
  )
}
