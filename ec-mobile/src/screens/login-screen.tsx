// Login screen
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useState } from 'react'
import { Alert, Text, View } from 'react-native'
import { RootStackParamList } from '.'
import { Button } from '@/components/button'
import { useAuthLogin } from '@/shared/query/auth/use-auth-login.mutation'
import { useAuthRefreshToken } from '@/shared/query/auth/use-auth-refresh-token.mutation'
import { BottomSheet } from '@/components/bottom-sheet'
import { useAccountStore, useAuthStore } from '@/store/auth.store'
import Icon from '@/components/icon'
import clsx from 'clsx'
import { TextInput } from '@/components/form/textinput'

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Login'
>

type Props = {
  navigation: LoginScreenNavigationProp
}

// login screen with nativewind (no styles API) with button to skip the login
export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { mutateAsync, isPending, error, reset } = useAuthLogin()
  const { setAuthStore } = useAuthStore()
  const { addAccount, accounts, removeAccount } = useAccountStore()
  const accountList = Object.values(accounts)

  const [isAddAccount, setIsAddAccount] = useState(accountList.length === 0)
  const { mutateAsync: refreshToken, isPending: isRefreshing } =
    useAuthRefreshToken()

  const handleLogin = () => {
    mutateAsync({ body: { username, password } }).then((resp) => {
      setAuthStore(resp)
      addAccount({
        username: resp.user.username,
        token: resp.token || '',
        refreshToken: resp.refreshToken || '',
      })
    })
  }

  const handleExistingLogin = (acc) => () => {
    refreshToken({
      body: { refreshToken: acc.refreshToken },
    })
      .then((resp) => {
        setAuthStore(resp)
        addAccount({
          username: acc.username,
          token: resp.token || '',
          refreshToken: resp.refreshToken || '',
        })
      })
      .catch((err) => {
        Alert.alert('Session expired', 'Please login again')
        removeAccount(acc.username)
        setIsAddAccount(true)
      })
  }

  return (
    <View className="flex-1 justify-center items-center bg-background p-4">
      <View className="my-auto w-full">
        {!isAddAccount ? (
          <View className="w-full items-center">
            {accountList.map((acc) => {
              return (
                <Button
                  key={acc.username}
                  className={clsx(
                    'flex-row gap-2 items-center bg-background p-3 rounded-md mb-3 border-gray-400 border w-full'
                  )}
                  icon="user-switch"
                  onPress={handleExistingLogin(acc)}
                  disabled={isRefreshing}
                >
                  {acc.username}
                </Button>
              )
            })}
          </View>
        ) : (
          <View className="w-full">
            <TextInput
              // className="w-full border border-gray-300 rounded p-2 mb-4"
              placeholder="Username"
              placeholderTextColor="gray"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <TextInput
              // className="w-full border border-gray-300 rounded p-2 mb-6 text-black"
              placeholder="Password"
              placeholderTextColor="gray"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Button
              className="mx-auto"
              variant="primary"
              onPress={handleLogin}
              disabled={isPending}
            >
              Login
            </Button>
          </View>
        )}
      </View>

      <View className="flex flex-row items-center">
        <Text className="text-primary">Dont' have an account?</Text>
        <Button variant="ghost" onPress={() => navigation.navigate('Signup')}>
          Sign Up
        </Button>
      </View>
      <View className="mt-4 flex-row items-center">
        {accountList.length > 0 && (
          <Button variant="ghost" onPress={() => setIsAddAccount(!isAddAccount)}>
            {isAddAccount ? 'Use Existing Account' : 'User Another Account'}
          </Button>
        )}
        <Button variant="ghost" onPress={() => navigation.replace('HomeTab')}>
          Skip login
        </Button>
      </View>
      <BottomSheet isOpen={!!error} setIsOpen={reset}>
        <View className="flex justify-center items-center">
          <Text>Something went wrong</Text>
          <Text>{String((error as any)?.message ?? error)}</Text>
        </View>
      </BottomSheet>
    </View>
  )
}
