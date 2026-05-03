import { Button } from "@/components/button";
import { useGetCart } from "@/module/cart/usecases/use-get-cart";
import { useCartCheckoutCart } from "@/shared/query/cart/use-cart-checkout-cart.mutation";
import { useCartCompleteCheckout } from "@/shared/query/cart/use-cart-complete-checkout.mutation";
import { CartItem } from "@/shared/types/api";
import { useUserGetAddresses } from "@/shared/query/user/use-user-get-addresses.query";
import { useUserGetProfile } from "@/shared/query/user/use-user-get-profile.query";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Text,
  View,
  Image,
  ActivityIndicator,
  Switch,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Routes, StackScreenProp } from ".";
import { Layout } from "@/layout/layout";
import clsx from "clsx";
import Icon from "@/components/icon";
import { LinearGradient } from "@/components/gradient";
import { useThemes } from "@/shared/hooks/use-themes";

const withOpacity = (color: string, opacity: number) => {
  if (color.startsWith("#")) {
    let hex = color.slice(1);

    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((char) => char + char)
        .join("");
    }

    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);

      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
  }

  const rgbMatch = color.match(/rgba?\(([^)]+)\)/);

  if (rgbMatch) {
    const [r, g, b] = rgbMatch[1].split(",").map((value) => value.trim());
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  return color;
};

export const CheckoutScreen: React.FC<StackScreenProp<"Checkout">> = ({
  navigation,
}) => {
  const { primary } = useThemes();
  const { data: cart } = useGetCart();
  const {
    mutateAsync: checkout,
    data: checkoutData,
    isPending,
  } = useCartCheckoutCart();
  const {
    mutateAsync: complete,
    data,
    isPending: isCompleting,
  } = useCartCompleteCheckout();
  const { data: profile } = useUserGetProfile();
  const { data: addresses, isLoading: addressesLoading } = useUserGetAddresses(
    { params: { path: { userId: String(profile?.id) } } },
    { enabled: !!profile?.id },
  );
  const [selectedAddressId, setSelectedAddressId] = useState<
    number | undefined
  >();
  const [payment, setPayment] = useState("");

  // Auto-select if only one address
  useEffect(() => {
    if (addresses?.length === 1 && !selectedAddressId) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [addresses]);

  useEffect(() => {
    if (cart?.sessionId) {
      checkout({});
    }
  }, [cart?.sessionId]);

  const items = checkoutData?.items || [];
  const payments = checkoutData?.paymentMethods || [];
  const paymentMethodLabels = {
    direct_transfer: "Direct Transfer",
    debit_credit: "Debit/Credit Card",
    ecpoint: "EC Point",
  };
  const primaryColor = primary.toString();
  const selectedPaymentGradient = [
    withOpacity(primaryColor, 1),
    withOpacity(primaryColor, 0.77),
    withOpacity(primaryColor, 0.52),
    withOpacity(primaryColor, 0),
  ] as const;

  function handlePurchase() {
    if (!cart) return;
    if (!payment) {
      Alert.alert("Payment method required", "Please select a payment method.");
      return;
    }

    complete({
      body: { paymentMethod: payment, addressId: selectedAddressId },
    }).then((resp) => {
      navigation.replace(Routes.Payment, {
        orderId: resp.orderId,
        transactionToken: resp.transactionToken,
        redirectUrl: resp.redirectUrl,
      })
    });
  }

  function handleAddAddress() {
    navigation.navigate(Routes.AddressEdit, {});
  }

  function handleSelectAddress(addressId: number) {
    setSelectedAddressId(addressId);
    navigation.replace(Routes.Checkout);
  }

  function renderItem({ item }: { item: CartItem }) {
    return (
      <View className="bg-background m-2 p-4 rounded-lg shadow">
        <View className="flex-row">
          <Image
            source={{
              uri: `https://picsum.photos/140/140?random=${item.productVariant.product.name}`,
            }}
            className="w-16 h-16 mr-4 rounded"
            resizeMode="cover"
          />
          <View className="flex-1">
            <Text className="font-bold text-text">
              {item.productVariant.product.name}
            </Text>
            <Text className="text-text">{item.productVariant.name}</Text>
          </View>
          <View className="items-end">
            <Text className="font-bold text-text">Price: {item.price}</Text>
            <Text className="text-text">Quantity: {item.quantity}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <Layout className="relative h-full">
      {isPending ? (
        <View className="flex flex-1 justify-center items-center">
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            renderItem={renderItem}
            ListFooterComponent={() => {
              const selectedAddr = addresses?.find(
                (a) => a.id === selectedAddressId,
              );
              return (
                <View className="bg-background mt-2 py-4">
                  {/* Address Picker */}
                  <Text className="text-xl text-text mb-3 px-4">
                    Delivery Address
                  </Text>
                  <TouchableOpacity
                    className={clsx(
                      "mx-4 rounded-xl p-4",
                      selectedAddr
                        ? "bg-surface/5 border border-primary/30 flex-row justify-between items-center"
                        : "border border-dashed border-text-secondary/30 items-center",
                    )}
                    onPress={() =>
                      addresses?.length
                        ? navigation.navigate(Routes.AddressList, {
                            onSelect: handleSelectAddress,
                          })
                        : handleAddAddress()
                    }
                  >
                    {selectedAddr ? (
                      <>
                        <View className="flex-1">
                          <Text className="font-bold text-text">
                            {selectedAddr.label}
                          </Text>
                          <Text className="text-sm text-text-secondary">
                            {selectedAddr.address}
                          </Text>
                        </View>
                        <Icon
                          name="right"
                          size={16}
                          className="color-textSecondary"
                        />
                      </>
                    ) : (
                      <Text className="text-text-secondary">
                        {addresses?.length
                          ? "Select a delivery address"
                          : "Add a delivery address"}
                      </Text>
                    )}
                  </TouchableOpacity>

                  {/* Payment Method */}
                  <Text className="text-xl text-text mb-4 px-4 mt-6">
                    Payment Method
                  </Text>
                  <FlatList
                    data={payments}
                    ItemSeparatorComponent={() => (
                      <View className="border-[0.5px] border-background-200 opacity-20" />
                    )}
                    renderItem={({ item: method, separators }) => {
                      const selected = method == payment;
                      return (
                        <View
                          key={method}
                          onTouchEnd={() => setPayment(method)}
                          className="flex flex-row justify-between items-center p-4"
                        >
                          <Text
                            className={clsx(
                              selected ? "text-surface" : "text-text",
                              "z-20",
                            )}
                          >
                            {paymentMethodLabels[method]}
                          </Text>
                          {selected ? (
                            <LinearGradient
                              colors={selectedPaymentGradient}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              locations={[0, 0.4, 0.6, 1]}
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                              }}
                            ></LinearGradient>
                          ) : null}
                          {selected ? (
                            <Icon
                              className="absolute right-5 color-primary"
                              name="check"
                              size={20}
                            />
                          ) : null}
                        </View>
                      );
                    }}
                  />
                </View>
              );
            }}
          ></FlatList>
          <View className="absolute w-full bottom-0 bg-background p-safe-or-5">
            <Button
              icon="arrow-right"
              disabled={isCompleting}
              onPress={handlePurchase}
              className="ml-auto"
            >
              Purchase
            </Button>
          </View>
        </>
      )}
    </Layout>
  );
};
