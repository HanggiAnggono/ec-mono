import { StackNavigationProp } from '@react-navigation/stack'
import React, { useState } from 'react'
import { Alert, Button, Text, TextInput, View } from 'react-native'
import { RootStackParamList } from '.'
import { useAuthSignup } from '@/shared/query/auth/use-auth-signup.mutation'
import { useAccountStore, useAuthStore } from '@/store/auth.store'
import { useQueryClient } from '@tanstack/react-query'
import { useCart } from '@/store/cart.store'

type SignupScreenProps = StackNavigationProp<RootStackParamList, 'Login'>

type Props = {
  navigation: SignupScreenProps
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// signup screen with nativewind (no styles API) with button to go back to login
export const SignupScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullname, setFullname] = useState('')
  const [phone, setPhone] = useState('')
  const { mutateAsync: signup, isPending } = useAuthSignup()
  const { setAuthStore } = useAuthStore()
  const { addAccount } = useAccountStore()
  const { setCartSessionId } = useCart()
  const queryclient = useQueryClient()

  const handleSignup = async () => {
    if (
      email &&
      phone &&
      password &&
      fullname &&
      emailRegex.test(email) &&
      password === confirmPassword
    ) {
      try {
        const [firstname, ...lastname] = fullname.split(' ')
        const res = await signup({
          body: {
            username: email,
            password,
            email,
            phone,
            firstname,
            lastname: lastname.join(' '),
          },
        })

        if (res.token) {
          addAccount({
            username: res.user.username,
            token: res.token,
            refreshToken: res.refreshToken,
          })
          setAuthStore({
            token: res.token,
            refreshToken: res.refreshToken,
            user: res.user,
          })
          setCartSessionId('')
          queryclient.clear()
          Alert.alert('Signup Successful', '', [
            {
              text: 'OK',
            },
          ])
        }
      } catch (error) {
        Alert.alert(
          'Signup Failed',
          error?.message?.toString() || 'An error occurred'
        )
      }
    } else {
      Alert.alert('Signup Failed', 'Please enter valid information')
    }
  }

  return (
    <View className="flex-1 justify-center items-center bg-background p-4">
      <Text className="text-2xl font-bold mb-6 text-text">Sign Up</Text>
      <TextInput
        className="w-full border border-gray-300 rounded p-2 mb-4 placeholder:text-text"
        placeholder="Full Name"
        value={fullname}
        onChangeText={setFullname}
        autoCapitalize="none"
      />
      <TextInput
        className="w-full border border-gray-300 rounded p-2 mb-4 placeholder:text-text"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        className="w-full border border-gray-300 rounded p-2 mb-4 placeholder:text-text"
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        className="w-full border border-gray-300 rounded p-2 mb-4 placeholder:text-text"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        className="w-full border border-gray-300 rounded p-2 mb-4 placeholder:text-text"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <Button
        title="Create Your Account"
        onPress={handleSignup}
        disabled={isPending}
      />
      <View className="mt-4 flex flex-row items-center">
        <Text className="text-text">Already have an account?</Text>
        <Button
          title="Log In"
          onPress={() => navigation.goBack()}
          color="#007BFF"
        />
      </View>
    </View>
  )
}
