import Icon from '@/components/icon'
import { useGetCart } from '@/module/cart/usecases/use-get-cart'
import { useThemes } from '@/shared/hooks/use-themes'
import { Link, useFocusEffect } from '@react-navigation/native'
import { useCallback } from 'react'
import { Text, View } from 'react-native'

export const CartContainer = () => {
  const { refetch, data: cart } = useGetCart()
  const { text } = useThemes()

  // Sync cart session id
  useFocusEffect(
    useCallback(() => {
      refetch()
    }, [])
  )

  return (
    <Link
      screen="Cart"
      params={{}}
      className="mr-4 flex justify-center items-center rounded-xl "
    >
      <View>
        {cart?.items?.length ? (
          <View className="absolute -top-2 -left-2 z-10  size-6 rounded-full bg-red-400 flex justify-center items-center">
            <Text className="text-xs">{cart?.items?.length}</Text>
          </View>
        ) : null}
        <Icon name="shopping-cart" size={24} color={text.toString()} />
      </View>
    </Link>
  )
}
