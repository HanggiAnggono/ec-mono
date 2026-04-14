import { Button } from '@/components/button'
import Icon from '@/components/icon'
import { Layout } from '@/layout/layout'
import { useUserGetProfile } from '@/shared/query/user/use-user-get-profile.query'
import { useAuthStore } from '@/store/auth.store'
import { useQueryClient } from '@tanstack/react-query'
import { Alert, Pressable, Text, TouchableOpacity, View } from 'react-native'

export const SettingScreen = () => {
  const { data, isError, refetch } = useUserGetProfile()
  const queryClient = useQueryClient()
  const { setAuthStore } = useAuthStore()

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: () => {
          setAuthStore({ token: undefined, refreshToken: undefined })
          queryClient.clear()
        },
      },
    ])
  }

  return (
    <Layout className="flex-1 p-4">
      <View className="bg-background rounded-t-md p-4">
        {isError ? (
          <Pressable
            onPress={() => {
              refetch()
            }}
          >
            <Text className="text-red-500">
              Error loading profile, tap to retry
            </Text>
          </Pressable>
        ) : (
          <View className="flex-row gap-3">
            <Icon
              name="user"
              size={25}
              className="border border-text p-3 self-start color-text rounded-full"
            />
            <View>
              <Text className="text-lg text-text">{data?.email}</Text>
              <Text className="text-text">{data?.username}</Text>
            </View>
          </View>
        )}
      </View>
      <TouchableOpacity
        onPress={handleLogout}
        className="items-center flex-row justify-between bg-background p-4 border-t border-t-background-400"
      >
        <Text className="text-text">Logout</Text>
        <Icon className="color-text" name="right" size={16} />
      </TouchableOpacity>
    </Layout>
  )
}
