import Card from "@/components/card";
import { Layout } from "@/layout/layout";
import Icon from "@/components/icon";
import { Button } from "@/components/button";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Platform,
} from "react-native";
import { useUserGetAddresses } from "@/shared/query/user/use-user-get-addresses.query";
import { useUserCreateAddress } from "@/shared/query/user/use-user-create-address.mutation";
import { useUserUpdateAddress } from "@/shared/query/user/use-user-update-address.mutation";
import { useUserGetProfile } from "@/shared/query/user/use-user-get-profile.query";
import { useState, useEffect, useRef } from "react";
import MapView, { Marker } from "react-native-maps";
import { useQueryClient } from "@tanstack/react-query";

const DEFAULT_LAT = -6.2088;
const DEFAULT_LNG = 106.8456;

export const AddressEditScreen = ({ navigation, route }: any) => {
  const queryClient = useQueryClient();
  const { addressId } = route.params || {};
  const isEdit = !!addressId;

  const { data: profile } = useUserGetProfile();
  const { data: addresses } = useUserGetAddresses(
    { params: { path: { userId: String(profile?.id) } } },
    { enabled: !!profile?.id },
  );

  const createAddress = useUserCreateAddress({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/user/addresses/${profile?.id}`],
      });
      navigation.goBack();
    },
    onError: (err: any) =>
      Alert.alert("Error", err?.message || "Failed to save address"),
  });

  const updateAddress = useUserUpdateAddress({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/user/addresses/${profile?.id}`],
      });
      navigation.goBack();
    },
    onError: (err: any) =>
      Alert.alert("Error", err?.message || "Failed to update address"),
  });

  const existingAddress = addresses?.find((a) => a.id === addressId);

  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState<number>(DEFAULT_LAT);
  const [longitude, setLongitude] = useState<number>(DEFAULT_LNG);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (existingAddress) {
      setLabel(existingAddress.label);
      setAddress(existingAddress.address);
      setDescription(existingAddress.description || "");
      setLatitude(existingAddress.latitude ?? DEFAULT_LAT);
      setLongitude(existingAddress.longitude ?? DEFAULT_LNG);
    }
  }, [existingAddress]);

  const handleMapPress = (e: any) => {
    const { latitude: lat, longitude: lng } = e.nativeEvent.coordinate;
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleSubmit = () => {
    if (!label.trim()) return Alert.alert("Validation", "Label is required");
    if (!address.trim())
      return Alert.alert("Validation", "Address is required");

    const body = {
      label: label.trim(),
      address: address.trim(),
      description: description.trim() || undefined,
      latitude,
      longitude,
    };

    if (isEdit) {
      updateAddress.mutate({
        params: { path: { id: String(addressId) } },
        body,
      });
    } else {
      createAddress.mutate({
        body: { userId: profile!.id, ...body },
      });
    }
  };

  const isSaving = createAddress.isPending || updateAddress.isPending;

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

        <View className="flex-1 min-h-[300px] relative">
          <View
            className="absolute  z-10 size-3 bg-red-400 rounded-full"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          ></View>
          <MapView
            ref={mapRef}
            className="flex-1"
            style={{ flex: 1 }}
            initialRegion={{
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            onRegionChangeComplete={(region) => {
              setLatitude(region.latitude);
              setLongitude(region.longitude);
            }}
            onPress={handleMapPress}
          >
            <Marker
              coordinate={{ latitude, longitude }}
              draggable
              onDragEnd={(e) => {
                const { latitude: lat, longitude: lng } =
                  e.nativeEvent.coordinate;
                setLatitude(lat);
                setLongitude(lng);
              }}
            />
          </MapView>
        </View>

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
            {isEdit ? "Edit Address" : "Add Address"}
          </Text>

          <View className="gap-1.5">
            <Text className="text-sm text-text-secondary font-semibold">
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
            <Text className="text-sm text-text-secondary font-semibold">
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
            <Text className="text-sm text-text-secondary font-semibold">
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
            className="mt-2 ml-auto"
            loading={isSaving}
          >
            {isEdit ? "Update Address" : "Save Address"}
          </Button>
        </Card>
      </View>
    </Layout>
  );
};
