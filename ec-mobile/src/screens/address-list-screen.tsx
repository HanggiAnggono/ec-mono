import Card from '@/components/card'
import { Layout } from '@/layout/layout'
import Icon from '@/components/icon'
import { useAuthStore } from '@/store/auth.store'
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Routes } from '@/screens'
import { useGetAddress } from '@/shared/query/user/use-address.mutation'
import { useUserGetProfile } from '@/shared/query/user/use-user-get-profile.query'

export const AddressListScreen = ({ navigation }: any) => {
  const { token } = useAuthStore()
  const { data: profile } = useUserGetProfile(undefined, {
    enabled: !!token,
  })
  const { data: address, isLoading } = useGetAddress(profile?.id)

  return (
    <Layout className="flex-1 bg-background p-4">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-3xl font-black text-text">My Address</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate(Routes.AddressEdit)}
          className="bg-primary px-4 py-2 rounded-full"
        >
          <Text className="text-white font-bold text-sm">
            {address ? 'Edit' : '+ Add'}
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#90abff" />
        </View>
      ) : address ? (
        <Card className="p-5 gap-3">
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-bold text-text">{address.label}</Text>
          </View>
          {address.description ? (
            <Text className="text-sm text-textSecondary">{address.description}</Text>
          ) : null}
          <Text className="text-sm text-textSecondary">{address.address}</Text>
          {address.latitude && address.longitude ? (
            <Text className="text-xs text-textSecondary opacity-60">
              📍 {address.latitude.toFixed(4)}, {address.longitude.toFixed(4)}
            </Text>
          ) : null}
        </Card>
      ) : (
        <View className="flex-1 items-center justify-center gap-3">
          <Icon name="environment" size={48} className="color-textSecondary opacity-30" />
          <Text className="text-textSecondary text-center">
            No address saved yet.{'\n'}Tap "Add" to set your delivery address.
          </Text>
        </View>
      )}
    </Layout>
  )
}
