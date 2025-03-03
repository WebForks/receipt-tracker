// apps/(tabs)/more/accounts-cards.tsx
import React from "react";
import { View, Text } from "react-native";
import "~/global.css";

export default function AccountsCards() {
  return (
    <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
      <Text className="text-xl font-bold dark:text-white">
        Accounts & Cards
      </Text>
    </View>
  );
}
