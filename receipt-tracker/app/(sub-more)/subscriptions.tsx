import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import "~/global.css";

export default function Subscriptions() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      {/* Header with back button */}
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text className="text-blue-500 text-lg">← Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold">Subscriptions</Text>
      </View>

      {/* Scrollable content area */}
      <ScrollView className="flex-1">
        <View className="p-4">
          <Text className="text-gray-500">
            Your subscriptions will appear here
          </Text>
        </View>
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        onPress={() => router.push("/(sub-more)/add-subscription")}
        className="absolute bottom-6 right-6 w-14 h-14 bg-blue-500 rounded-full items-center justify-center shadow-lg"
        style={{ elevation: 5 }}
      >
        <Text className="text-white text-3xl font-bold">+</Text>
      </TouchableOpacity>
    </View>
  );
}
