import Icon from '@/components/icon'
import { fetchFefreshToken } from '@/module/auth/fetch-refresh-token'
import { fetchClient } from '@/module/core'
import { RootStackParamList, Routes } from '@/screens'
import { CartScreen } from '@/screens/cart-screen'
import { HomeScreen } from '@/screens/home-screen'
import { LoginScreen } from '@/screens/login-screen'
import { ProductDetailPage } from '@/screens/product-detail-screen'
import { SettingScreen } from '@/screens/setting-screen'
import { SignupScreen } from '@/screens/signup-screen'
import { useAuthStore } from '@/store/auth.store'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import React, { useEffect } from 'react'
import './global.css'
import { CheckoutScreen } from '@/screens/checkout-screen'
import { PaymentScreen } from '@/screens/payment-screen'
import { OrderDetailScreen } from '@/screens/order-detail-screen'
import { OrdersScreen } from '@/screens/orders-screen'
import { AddressListScreen } from '@/screens/address-list-screen'
import { AddressEditScreen } from '@/screens/address-edit-screen'
import { MainTabBar } from '@/components/main-tab-bar'
import { useThemes } from '@/shared/hooks/use-themes'
import { useColorScheme } from 'nativewind'

const Stack = createStackNavigator<RootStackParamList>()
const HomeTab = createBottomTabNavigator()

function HomeNavigator() {
  const { token } = useAuthStore()
  const { primary } = useThemes()
  const { colorScheme } = useColorScheme()
  const text = colorScheme === 'dark' ? '#fff' : '#000'

  return (
    <HomeTab.Navigator
      tabBar={(p) => <MainTabBar {...p} />}
      screenOptions={{
        headerTransparent: false,
        headerStyle: {
          backgroundColor: primary,
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: text,
      }}
    >
      <HomeTab.Screen
        name={Routes.Home}
        component={HomeScreen}
        options={{
          headerTransparent: true,
          headerStyle: {
            backgroundColor: 'transparent',
          },
          tabBarIcon: ({ color, size, focused }) => (
            <Icon name="home" color={color} size={size} />
          ),
        }}
      />
      <HomeTab.Screen
        name={Routes.Orders}
        component={OrdersScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="shopping" color={color} size={size} />
          ),
        }}
      />
      <HomeTab.Screen
        name={Routes.Setting}
        component={SettingScreen}
        navigationKey={token ? 'user' : 'guest'}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="user" color={color} size={size} />
          ),
        }}
      />
    </HomeTab.Navigator>
  )
}

function handleUnauthorized(request, queryClient: QueryClient) {
  const { refreshToken, setAuthStore } = useAuthStore.getState()
  fetchFefreshToken({
    refreshToken,
    callback: () => queryClient.fetchQuery(request),
  })
    .then(({ queues, response }) => {
      setAuthStore({
        token: response?.token,
        refreshToken: response?.refreshToken,
      })

      queues.forEach((req) => {
        req()
      })
    })
    .catch((err) => {
      console.log('Failed to refresh token, logging out...', err)
      setAuthStore({ token: undefined, refreshToken: undefined })
      return
    })
}

export default function App() {
  const { token } = useAuthStore()
  const { primary, text } = useThemes()
  const [client] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: __DEV__ ? false : 2,
          },
        },
        queryCache: new QueryCache({
          onError: (error, query) => {
            console.error(
              `[${query.queryKey}] Error in query ${query.queryKey}:`,
              error
            )
            if (error?.statusCode === 401) {
              handleUnauthorized(query, client)
            }
          },
        }),
        mutationCache: new MutationCache({
          onError(error, variables, context, mutation) {
            console.error(
              `[${error.name}] Error in mutation ${mutation.options.mutationKey}:`,
              error
            )
            if (error?.statusCode === 401) {
              handleUnauthorized(mutation, client)
            }
          },
        }),
      })
  )

  useEffect(() => {
    if (token) {
      fetchClient.use({
        onRequest: async (cl) => {
          cl.request.headers.set('Authorization', `Bearer ${token}`)
          return cl.request
        },
      })
    }
  }, [token, fetchClient])

  return (
    <QueryClientProvider client={client}>
      <NavigationContainer>
        <Stack.Navigator
          key={token ? 'user' : 'guest'}
          screenOptions={{
            headerStyle: {
              backgroundColor: primary,
            },
            headerTintColor: '#fff',
          }}
        >
          {!token ? (
            <>
              <Stack.Screen
                name={Routes.Login}
                component={LoginScreen}
                options={{
                  headerShown: false,
                  headerLeftContainerStyle: { opacity: 0 },
                }}
              />
              <Stack.Screen
                name={Routes.Signup}
                component={SignupScreen}
                options={{
                  headerShown: false,
                  headerLeftContainerStyle: { opacity: 0 },
                }}
              />
            </>
          ) : null}
          <Stack.Screen
            name={Routes.HomeTab}
            component={HomeNavigator}
            navigationKey={token ? 'user' : 'guest'}
            options={{
              title: '',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name={Routes.ProductDetail}
            options={{ title: 'Product Detail' }}
            component={ProductDetailPage}
          />
          <Stack.Screen
            name={Routes.Cart}
            options={{ title: 'Your Cart' }}
            component={CartScreen}
          />
          {token ? (
            <>
              <Stack.Screen
                name={Routes.Checkout}
                options={{ title: 'Checkout' }}
                component={CheckoutScreen}
              />
              <Stack.Screen
                name={Routes.Payment}
                options={{ title: 'Payment' }}
                component={PaymentScreen}
              />
              <Stack.Screen
                name={Routes.OrderDetail}
                options={{ title: 'Order Detail' }}
                component={OrderDetailScreen}
              />
              <Stack.Screen
                name={Routes.AddressList}
                options={{ title: 'Address' }}
                component={AddressListScreen}
              />
              <Stack.Screen
                name={Routes.AddressEdit}
                options={{ title: 'Edit Address' }}
                component={AddressEditScreen}
              />
            </>
          ) : null}
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  )
}
