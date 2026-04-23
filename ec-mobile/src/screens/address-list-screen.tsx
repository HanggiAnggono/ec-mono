import Card from '@/components/card'
import { Layout } from '@/layout/layout'
import Icon from '@/components/icon'
import { useAuthStore } from '@/store/auth.store'
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Routes } from '@/screens'
import { useUserGetAddresses } from '@/shared/query/user/use-user-get-addresses.query'
import { useUserDeleteAddress } from '@/shared/query/user/use-user-delete-address.mutation'
import { useUserGetProfile } from '@/shared/query/user/use-user-get-profile.query'
import { useQueryClient } from '@tanstack/react-query'

export const AddressListScreen = ({ navigation }: any) => {
  const { token } = useAuthStore()
  const queryClient = useQueryClient()
  const { data: profile } = useUserGetProfile(undefined, {
    enabled: !!token,
  })
  const { data: addresses, isLoading } = useUserGetAddresses(
    { params: { path: { userId: String(profile?.id) } } },
    { enabled: !!profile?.id },
  )
  const deleteAddress = useUserDeleteAddress({
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['/user/addresses/{userId}'] }),
  })

  const handleDelete = (id: number, label: string) => {
    Alert.alert('Delete Address', `Delete "${label}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          deleteAddress.mutate({ params: { path: { id: String(id) } } }),
      },
    ])
  }

  return (
    <Layout className="flex-1 bg-background p-4">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-3xl font-black text-text">Addresses</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate(Routes.AddressEdit, {})}
          className="bg-primary px-4 py-2 rounded-full"
        >
          <Text className="text-white font-bold text-sm">+ Add New</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#90abff" />
        </View>
      ) : addresses?.length ? (
        <View className="gap-4">
          {addresses.map((addr) => (
            <TouchableOpacity
              key={addr.id}
              onPress={() =>
                navigation.navigate(Routes.AddressEdit, {
                  addressId: addr.id,
                })
              }
              activeOpacity={0.7}
            >
              <Card className="p-5 gap-2">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1 gap-1">
                    <Text className="text-base font-bold text-text">
                      {addr.label}
                    </Text>
                    <Text className="text-sm text-textSecondary">
                      {addr.address}
                    </Text>
                    {addr.description ? (
                      <Text className="text-sm text-textSecondary opacity-70">
                        {addr.description}
                      </Text>
                    ) : null}
                    {addr.latitude && addr.longitude ? (
                      <Text className="text-xs text-textSecondary opacity-50">
                        📍 {addr.latitude.toFixed(4)},{' '}
                        {addr.longitude.toFixed(4)}
                      </Text>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDelete(addr.id, addr.label)}
                    hitSlop={10}
                  >
                    <Icon
                      name="delete"
                      size={18}
                      className="color-red-400"
                    />
                  </TouchableOpacity>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View className="flex-1 items-center justify-center gap-3">
          <Icon
            name="environment"
            size={48}
            className="color-textSecondary opacity-30"
          />
          <Text className="text-textSecondary text-center">
            No addresses saved yet.{'\n'}Tap "+ Add New" to get started.
          </Text>
        </View>
      )}
    </Layout>
  )
}
