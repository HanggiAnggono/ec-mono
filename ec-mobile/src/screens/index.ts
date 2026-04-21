import { StackNavigationProp } from '@react-navigation/stack'

export type RootStackParamList = {
  Onboarding: undefined
  Login: undefined
  Signup: undefined
  HomeTab: undefined
  Home: undefined
  Setting: undefined
  ProductDetail: { id: string; variantId?: string }
  Cart: undefined
  Checkout: undefined
  Payment: { orderId?: string; transactionToken?: string; redirectUrl?: string }
  Orders: undefined
  OrderDetail: { orderId: string }
}

export type RouteName = keyof RootStackParamList
export type RouteParams = RootStackParamList

// Proxy-based runtime object derived from the type's keys.
// Accessing Routes.SomeKey returns "SomeKey" without manually repeating keys.
export const Routes = new Proxy(
  {},
  {
    get: (_target, prop) => prop,
  }
) as { [K in keyof RootStackParamList]: K }

export type StackScreenProp<T extends keyof RootStackParamList> = {
  navigation: StackNavigationProp<RootStackParamList, T>
  route: { params?: RootStackParamList[T] }
}
