import Card from "@/components/card";
import { Layout } from "@/layout/layout";
import Icon from "@/components/icon";
import { useAuthStore } from "@/store/auth.store";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Routes, StackScreenProp } from "@/screens";
import { useUserGetAddresses } from "@/shared/query/user/use-user-get-addresses.query";
import { useUserDeleteAddress } from "@/shared/query/user/use-user-delete-address.mutation";
import { useUserGetProfile } from "@/shared/query/user/use-user-get-profile.query";
import { useQueryClient } from "@tanstack/react-query";

export const AddressListScreen = ({
  navigation,
  route,
}: StackScreenProp<typeof Routes.AddressList>) => {
  const { token } = useAuthStore();
  const { onSelect } = route.params || {};
  const queryClient = useQueryClient();
  const { data: profile } = useUserGetProfile(undefined, {
    enabled: !!token,
  });
  const {
    data: addresses,
    isLoading,
    refetch,
    isRefetching,
  } = useUserGetAddresses(
    { params: { path: { userId: String(profile?.id) } } },
    { enabled: !!profile?.id },
  );
  const deleteAddress = useUserDeleteAddress({
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["/user/addresses/{userId}"] }),
  });

  const handleDelete = (id: number, label: string) => {
    Alert.alert("Delete Address", `Delete "${label}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          deleteAddress.mutate({ params: { path: { id: String(id) } } }),
      },
    ]);
  };

  const renderAddress = ({ item: addr }: { item: (typeof addresses)[0] }) => {
    const handlePressAddress = () => {
      if (onSelect) {
        onSelect(addr.id);
        return;
      }

      navigation.navigate(Routes.AddressEdit, {
        addressId: addr.id,
      });
    };

    return (
      <TouchableOpacity
        key={addr.id}
        onPress={handlePressAddress}
        activeOpacity={0.7}
        className="mb-3"
      >
        <Card className="p-5 gap-2">
          <View className="flex-row justify-between items-start">
            <View className="flex-1 gap-1">
              <Text className="text-base font-bold text-text">
                {addr.label}
              </Text>
              <Text className="text-sm text-text">{addr.address}</Text>
              {addr.description ? (
                <Text className="text-sm text-text  opacity-70">
                  {addr.description}
                </Text>
              ) : null}
              {addr.latitude && addr.longitude ? (
                <Text className="text-xs text-text opacity-50">
                  📍 {addr.latitude.toFixed(4)}, {addr.longitude.toFixed(4)}
                </Text>
              ) : null}
            </View>
            <TouchableOpacity
              onPress={() => handleDelete(addr.id, addr.label)}
              hitSlop={10}
            >
              <Icon name="delete" size={18} className="color-red-400" />
            </TouchableOpacity>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

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
        <View className="gap-4 flex-1">
          <FlatList
            data={addresses}
            renderItem={renderAddress}
            keyExtractor={(item) => item.id.toString()}
            refreshing={isRefetching}
            onRefresh={refetch}
          />
        </View>
      ) : (
        <View className="flex-1 items-center justify-center gap-3">
          <Icon
            name="environment"
            size={48}
            className="color-textSecondary opacity-30"
          />
          <Text className=" text-center">
            No addresses saved yet.{"\n"}Tap "+ Add New" to get started.
          </Text>
        </View>
      )}
    </Layout>
  );
};
