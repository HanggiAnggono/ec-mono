import Card from '@/components/card'
import { Layout } from '@/layout/layout'
import Icon from '@/components/icon'
import { Button } from '@/components/button'
import { Text, TextInput, TouchableOpacity, View, Alert } from 'react-native'
import { useUserGetAddresses } from '@/shared/query/user/use-user-get-addresses.query'
import { useUserCreateAddress } from '@/shared/query/user/use-user-create-address.mutation'
import { useUserUpdateAddress } from '@/shared/query/user/use-user-update-address.mutation'
import { useUserGetProfile } from '@/shared/query/user/use-user-get-profile.query'
import { useState, useEffect, useRef } from 'react'
import MapLibreGL from '@maplibre/maplibre-react-native'
import { useQueryClient } from '@tanstack/react-query'

MapLibreGL.setAccessToken(null)

const DEFAULT_STYLE_URL = 'https://demotiles.maplibre.org/style.json'

export const AddressEditScreen = ({ navigation, route }: any) => {
  const queryClient = useQueryClient()
  const { addressId } = route.params || {}
  const isEdit = !!addressId

  const { data: profile } = useUserGetProfile()
  const { data: addresses } = useUserGetAddresses(
    { params: { path: { userId: String(profile?.id) } } },
    { enabled: !!profile?.id }
  )

  const createAddress = useUserCreateAddress({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/user/addresses/{userId}'] })
      navigation.goBack()
    },
    onError: (err: any) =>
      Alert.alert('Error', err?.message || 'Failed to save address'),
  })

  const updateAddress = useUserUpdateAddress({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/user/addresses/{userId}'] })
      navigation.goBack()
    },
    onError: (err: any) =>
      Alert.alert('Error', err?.message || 'Failed to update address'),
  })

  const existingAddress = addresses?.find((a) => a.id === addressId)

  const [label, setLabel] = useState('')
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  const [latitude, setLatitude] = useState<number>(-6.2088)
  const [longitude, setLongitude] = useState<number>(106.8456)
  const cameraRef = useRef<MapLibreGL.Camera>(null)
  const didInit = useRef(false)

  useEffect(() => {
    if (existingAddress) {
      setLabel(existingAddress.label)
      setAddress(existingAddress.address)
      setDescription(existingAddress.description || '')
      setLatitude(existingAddress.latitude ?? -6.2088)
      setLongitude(existingAddress.longitude ?? 106.8456)
    }
  }, [existingAddress])

  useEffect(() => {
    if (!didInit.current && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [longitude, latitude],
        zoomLevel: 14,
      })
      didInit.current = true
    }
  }, [cameraRef.current, latitude, longitude])

  const handleMapPress = (e: any) => {
    const { geometry } = e.properties
    if (geometry?.coordinates) {
      const [lng, lat] = geometry.coordinates
      setLatitude(lat)
      setLongitude(lng)
    }
  }

  const handleMarkerDragEnd = (e: any) => {
    const { geometry } = e.properties
    if (geometry?.coordinates) {
      const [lng, lat] = geometry.coordinates
      setLatitude(lat)
      setLongitude(lng)
    }
  }

  const handleSubmit = () => {
    if (!label.trim()) return Alert.alert('Validation', 'Label is required')
    if (!address.trim()) return Alert.alert('Validation', 'Address is required')

    const body = {
      label: label.trim(),
      address: address.trim(),
      description: description.trim() || undefined,
      latitude,
      longitude,
    }

    if (isEdit) {
      updateAddress.mutate({
        params: { path: { id: String(addressId) } },
        body,
      })
    } else {
      createAddress.mutate({
        body: { userId: profile!.id, ...body },
      })
    }
  }

  const isSaving = createAddress.isPending || updateAddress.isPending

  return (
    <Layout className="flex-1 bg-background">
      {/* Map */}
      <View className="flex-1 min-h-[300px]">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-black/50 items-center justify-center"
        >
          <Icon name="left" size={20} className="color-white" />
        </TouchableOpacity>

        <MapLibreGL.MapView
          style={{ flex: 1 }}
          mapStyle={DEFAULT_STYLE_URL}
          onPress={handleMapPress}
        >
          <MapLibreGL.Camera ref={cameraRef} zoomLevel={14} />
          <MapLibreGL.MarkerView
            coordinate={[longitude, latitude]}
            draggable
            onDragEnd={handleMarkerDragEnd}
          >
            <View
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: '#ef4444',
                borderWidth: 3,
                borderColor: '#fff',
                shadowColor: '#000',
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 6,
              }}
            />
          </MapLibreGL.MarkerView>
        </MapLibreGL.MapView>

        <View className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 rounded-full">
          <Text className="text-white text-xs">
            Tap or drag the pin to set location
          </Text>
        </View>
      </View>

      {/* Form */}
      <View className="p-4">
        <Card className="p-4 gap-4">
          <Text className="text-lg font-bold text-text">
            {isEdit ? 'Edit Address' : 'Add Address'}
          </Text>

          <View className="gap-1.5">
            <Text className="text-sm text-textSecondary font-semibold">
              Label *
            </Text>
            <TextInput
              value={label}
              onChangeText={setLabel}
              placeholder="e.g., Home, Office"
              placeholderTextColor="#40485d"
              className="w-full bg-background rounded-xl px-4 py-3 text-text text-sm"
            />
          </View>

          <View className="gap-1.5">
            <Text className="text-sm text-textSecondary font-semibold">
              Address *
            </Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Enter your full address"
              placeholderTextColor="#40485d"
              className="w-full bg-background rounded-xl px-4 py-3 text-text text-sm"
              multiline
              numberOfLines={2}
            />
          </View>

          <View className="gap-1.5">
            <Text className="text-sm text-textSecondary font-semibold">
              Description (Optional)
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="e.g., Floor 2, near the minimarket"
              placeholderTextColor="#40485d"
              className="w-full bg-background rounded-xl px-4 py-3 text-text text-sm"
            />
          </View>

          <Button
            variant="primary"
            onPress={handleSubmit}
            className="w-full mt-2"
            loading={isSaving}
          >
            {isEdit ? 'Update Address' : 'Save Address'}
          </Button>
        </Card>
      </View>
    </Layout>
  )
}
