import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import "~/global.css";

export default function Manual() {
  const { aiResponse } = useLocalSearchParams();

  let parsedData;
  try {
    parsedData = JSON.parse(aiResponse as string);
  } catch (err) {
    parsedData = aiResponse;
  }
  console.log(parsedData);

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <View className="justify-center items-center">
        <Text className="text-xl font-bold mb-4">Manual</Text>
        <Text className="text-base  font-mono">
          {JSON.stringify(parsedData, null, 2)}
        </Text>
      </View>
    </ScrollView>
  );
}
