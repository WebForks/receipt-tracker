import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TextInput, Dimensions } from "react-native";
import { useLocalSearchParams } from "expo-router";
import "~/global.css";
import { supabase } from "~/utils/supabase";

export default function Manual() {
  const { aiResponse } = useLocalSearchParams();
  console.log("aiResponse", aiResponse);
  const [formData, setFormData] = useState({
    title: "",
    note: "",
    date: "",
    total_cost: "",
  });

  // Get screen dimensions
  const screenHeight = Dimensions.get("window").height;
  const noteFieldHeight = screenHeight * 0.3; // 30% of screen height

  useEffect(() => {
    if (aiResponse) {
      try {
        // First parse the outer JSON to get the response string
        const outerParsed = JSON.parse(aiResponse as string);

        // Extract the inner JSON from the markdown code block
        const jsonMatch = outerParsed.response.match(
          /```json\n([\s\S]*?)\n```/
        );
        if (jsonMatch && jsonMatch[1]) {
          const parsedData = JSON.parse(jsonMatch[1]);
          setFormData({
            title: parsedData.title || "",
            note: parsedData.note || "",
            date: parsedData.date
              ? new Date(parsedData.date).toISOString().split("T")[0]
              : "",
            total_cost: parsedData.total_cost
              ? parsedData.total_cost.toString()
              : "",
          });
          console.log("parsedData", parsedData);
        }
      } catch (err) {
        console.error("Error parsing data:", err);
      }
    }
  }, [aiResponse]);

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <View className="justify-center items-center mb-6">
        <Text className="text-xl font-bold text-black">Manual Entry</Text>
      </View>

      <View className="space-y-4">
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Title</Text>
          <TextInput
            className="w-full border border-gray-300 rounded-md p-2 text-black bg-white"
            value={formData.title}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, title: text }))
            }
            placeholder="Enter title"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Note</Text>
          <View
            style={{ height: noteFieldHeight }}
            className="w-full border border-gray-300 rounded-md bg-white"
          >
            <ScrollView>
              <TextInput
                className="p-2 text-black"
                value={formData.note}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, note: text }))
                }
                placeholder="Enter note"
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
                style={{ minHeight: "100%" }}
              />
            </ScrollView>
          </View>
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Date</Text>
          <TextInput
            className="w-full border border-gray-300 rounded-md p-2 text-black bg-white"
            value={formData.date}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, date: text }))
            }
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">
            Total Cost
          </Text>
          <TextInput
            className="w-full border border-gray-300 rounded-md p-2 text-black bg-white"
            value={formData.total_cost}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, total_cost: text }))
            }
            placeholder="Enter total cost"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
        </View>
      </View>
    </ScrollView>
  );
}
