import { Button } from '@/components/button'
import { Layout } from '@/layout/layout'
import { formatCurrency } from '@/module/utils'
import { useOrderFindOne } from '@/shared/query/order/use-order-find-one.query'
import { usePaymentSyncPaymentStatus } from '@/shared/query/payment/use-payment-sync-payment-status.mutation'
import React, { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Linking,
  SafeAreaView,
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
  const { mutateAsync: syncPaymentStatus, isPending: isSyncing } =
    usePaymentSyncPaymentStatus()

  const paymentUrl = useMemo(() => {
    if (redirectUrl) return redirectUrl
    if (!transactionToken) return undefined

    return `https://app.sandbox.midtrans.com/snap/v4/redirection/${transactionToken}`
  }, [redirectUrl, transactionToken])

  const currentPayment = orderDetails?.payment
  const hasTerminalStatus = orderDetails
    ? TERMINAL_STATUSES.includes(orderDetails.order_status)
    : false

  const handleBackToHome = () => {
    navigation.navigate('HomeTab')
  }

  const handleSyncStatus = async () => {
    if (!orderId) return

    await syncPaymentStatus(orderId)
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
          <>
            <View className="px-4 py-4 border-b border-background-200 bg-background gap-2">
              <Text className="text-2xl font-bold text-text">Complete Payment</Text>
              <Text className="text-text">Order #{orderDetails.id}</Text>
              <Text className="text-text">
                Total {formatCurrency(orderDetails.totalAmount)}
              </Text>
              <Text className="text-text">
                Status {orderDetails.order_status.replaceAll('_', ' ')}
              </Text>
              {currentPayment ? (
                <Text className="text-text">
                  Midtrans status {currentPayment.transaction_status}
                </Text>
              ) : null}
            </View>

            {paymentUrl && showWebView && !hasTerminalStatus ? (
              <WebView
                source={{ uri: paymentUrl }}
                className="flex-1"
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
              <View className="flex-1 items-center justify-center px-6">
                <Text className="text-center text-text">
                  {hasTerminalStatus
                    ? 'Payment is already finalized.'
                    : 'Open the Midtrans payment page, complete the payment, then check the latest status here.'}
                </Text>
              </View>
            )}

            <View className="px-4 py-4 border-t border-background-200 bg-background gap-3">
              <View className="flex-row flex-wrap gap-3">
                <Button
                  onPress={() => handleSyncStatus().catch(console.error)}
                  disabled={isSyncing || isFetching}
                >
                  {isSyncing ? 'Checking...' : 'Check Payment Status'}
                </Button>
                {paymentUrl ? (
                  <Button
                    onPress={() => setShowWebView(true)}
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
          </>
        )}
      </SafeAreaView>
    </Layout>
  )
}
