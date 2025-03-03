// apps/(tabs)/more/subscriptions.tsx
import React from "react";
import { View, Text } from "react-native";
import "~/global.css";

export default function Subscriptions() {
  return (
    <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
      <Text className="text-xl font-bold dark:text-white">Subscriptions</Text>
    </View>
  );
}
