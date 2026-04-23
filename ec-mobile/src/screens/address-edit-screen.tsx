import Card from '@/components/card'
import { Layout } from '@/layout/layout'
import Icon from '@/components/icon'
import { Button } from '@/components/button'
import { Text, TextInput, TouchableOpacity, View, Alert } from 'react-native'
import { useGetAddress, useSaveAddress } from '@/shared/query/user/use-address.mutation'
import { useUserGetProfile } from '@/shared/query/user/use-user-get-profile.query'
import { useState, useEffect, useRef } from 'react'
import MapboxGL from '@rnmapbox/maps'

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN)

export const AddressEditScreen = ({ navigation }: any) => {
  const { data: profile } = useUserGetProfile()
  const { data: existingAddress } = useGetAddress(profile?.id)
  const saveAddress = useSaveAddress()

  const [label, setLabel] = useState('')
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  const [latitude, setLatitude] = useState<number | undefined>()
  const [longitude, setLongitude] = useState<number | undefined>()
  const [reverseGeocodeResult, setReverseGeocodeResult] = useState('')
  const [loadingGeocode, setLoadingGeocode] = useState(false)

  const cameraRef = useRef<MapboxGL.Camera>(null)

  useEffect(() => {
    if (existingAddress) {
      setLabel(existingAddress.label)
      setAddress(existingAddress.address)
      setDescription(existingAddress.description || '')
      setLatitude(existingAddress.latitude)
      setLongitude(existingAddress.longitude)
      if (existingAddress.address) {
        setReverseGeocodeResult(existingAddress.address)
      }
    }
  }, [existingAddress])

  const reverseGeocode = async (lat: number, lng: number) => {
    setLoadingGeocode(true)
    try {
      const token = process.env.EXPO_PUBLIC_MAPBOX_TOKEN
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}`
      )
      const json = await res.json()
      const place = json.features?.[0]
      if (place) {
        setReverseGeocodeResult(place.place_name)
        setAddress(place.place_name)
      }
    } catch (e) {
      console.error('Reverse geocode failed', e)
    } finally {
      setLoadingGeocode(false)
    }
  }

  const handleMapPress = (feature: any) => {
    const coords = feature.geometry.coordinates
    const lng = coords[0]
    const lat = coords[1]
    setLatitude(lat)
    setLongitude(lng)
    reverseGeocode(lat, lng)
  }

  const handleSubmit = () => {
    if (!label.trim()) {
      Alert.alert('Validation', 'Label is required')
      return
    }
    if (!address.trim()) {
      Alert.alert('Validation', 'Address is required')
      return
    }

    saveAddress.mutate(
      {
        userId: profile!.id,
        label: label.trim(),
        address: address.trim(),
        description: description.trim() || undefined,
        latitude,
        longitude,
      },
      {
        onSuccess: () => {
          navigation.goBack()
        },
        onError: (err: any) => {
          Alert.alert('Error', err?.message || 'Failed to save address')
        },
      }
    )
  }

  const initialCoords = latitude && longitude
    ? [longitude, latitude]
    : [106.8456, -6.2088] // default: Jakarta

  return (
    <Layout className="flex-1 bg-background">
      {/* Map */}
      <View className="flex-1 min-h-[300px]">
        <MapboxGL.MapView
          style={{ flex: 1 }}
          onPress={handleMapPress}
          logoEnabled={false}
          attributionEnabled={false}
        >
          <MapboxGL.Camera
            ref={cameraRef}
            centerCoordinate={initialCoords}
            zoomLevel={14}
          />
          <MapboxGL.PointAnnotation
            id="picker"
            coordinate={initialCoords}
            draggable
            onDragEnd={(feature) => {
              const [lng, lat] = feature.geometry.coordinates
              setLatitude(lat)
              setLongitude(lng)
              reverseGeocode(lat, lng)
            }}
          >
            <View
              style={{
                height: 32,
                width: 32,
                borderRadius: 16,
                backgroundColor: '#90abff',
                borderWidth: 3,
                borderColor: '#fff',
              }}
            />
          </MapboxGL.PointAnnotation>
        </MapboxGL.MapView>

        {loadingGeocode && (
          <View className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 rounded-full">
            <Text className="text-white text-xs">Looking up address...</Text>
          </View>
        )}
      </View>

      {/* Form */}
      <View className="p-4 gap-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-black/50 items-center justify-center"
        >
          <Icon name="left" size={20} className="color-white" />
        </TouchableOpacity>

        <Card className="p-4 gap-4">
          <Text className="text-lg font-bold text-text">
            {existingAddress ? 'Edit Address' : 'Add Address'}
          </Text>

          <View className="gap-1.5">
            <Text className="text-sm text-textSecondary font-semibold">Label *</Text>
            <TextInput
              value={label}
              onChangeText={setLabel}
              placeholder="e.g., Home, Office"
              placeholderTextColor="#40485d"
              className="w-full bg-background rounded-xl px-4 py-3 text-text text-sm"
            />
          </View>

          <View className="gap-1.5">
            <Text className="text-sm text-textSecondary font-semibold">Address *</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Address (auto-filled from map)"
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
            loading={saveAddress.isPending}
          >
            Save Address
          </Button>
        </Card>
      </View>
    </Layout>
  )
}
