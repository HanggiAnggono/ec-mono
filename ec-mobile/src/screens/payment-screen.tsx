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
import { Routes, StackScreenProp } from '.'
import { useQueryClient } from '@tanstack/react-query'

const TERMINAL_STATUSES = ['payment_received', 'failed', 'expired', 'cancelled']

export const PaymentScreen: React.FC<StackScreenProp<'Payment'>> = ({
  navigation,
  route,
}) => {
  const orderId = route.params?.orderId || ''
  const transactionToken = route.params?.transactionToken
  const redirectUrl = route.params?.redirectUrl
  const queryClient = useQueryClient()
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
      queryClient.invalidateQueries({ queryKey: ['/order'], exact: false })
      setShowWebView(false)
    }
  }

  const handleNavChange = (navState) => {
    setLastVisitedUrl(navState.url)

    if (navState.url.includes('order_id')) {
      const search = new URLSearchParams(navState.url.split('?')[1])
      const orderId = search.get('order_id')
      if (!orderId) return

      return navigation.popTo(Routes.OrderDetail, { orderId })
    }

    if (
      navState.url.includes('finish') ||
      navState.url.includes('unfinish') ||
      navState.url.includes('error') ||
      navState.url.includes('status_code=')
    ) {
      setShowWebView(false)
      handleSyncStatus().catch(console.error)
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
    <Layout className="flex-1 items-center justify-center">
      <WebView
        ref={webView}
        source={{ uri: paymentUrl }}
        className="flex-1 h-10"
        nestedScrollEnabled
        containerStyle={{
          flex: 1,
          width: '100%',
          height: '100%',
          paddingBottom: 70,
        }}
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
        onNavigationStateChange={handleNavChange}
      />
    </Layout>
  )
}
