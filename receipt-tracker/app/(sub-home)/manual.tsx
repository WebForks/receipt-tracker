import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Dimensions,
  TouchableOpacity,
} from "react-native";
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
  const [categories, setCategories] = useState<Record<string, string[]>>({});
  const [selectedMainCategory, setSelectedMainCategory] = useState<
    string | null
  >(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(
    null
  );

  // Get screen dimensions
  const screenHeight = Dimensions.get("window").height;
  const noteFieldHeight = screenHeight * 0.3; // 30% of screen height

  // Fetch categories from profiles table
  useEffect(() => {
    async function fetchCategories() {
      try {
        // Get current user
        const { data: userData, error: userError } =
          await supabase.auth.getUser();
        if (userError) {
          console.error("Error fetching user:", userError.message);
          return;
        }
        if (!userData?.user) {
          console.error("No user logged in");
          return;
        }

        // Fetch categories from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("categories")
          .eq("user_id", userData.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching categories:", profileError.message);
          return;
        }
        console.log("profileData", profileData);

        // Set categories if they exist, otherwise use empty object
        setCategories(profileData?.categories || {});
      } catch (err) {
        console.error("Error in fetchCategories:", err);
      }
    }

    fetchCategories();
  }, []);

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

  const handleMainCategoryPress = (category: string) => {
    if (selectedMainCategory === category) {
      // If clicking the same category, unselect it
      setSelectedMainCategory(null);
      setSelectedSubCategory(null);
    } else {
      // Select new category
      setSelectedMainCategory(category);
      setSelectedSubCategory(null);
    }
  };

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

        {/* Categories Section */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Category
          </Text>
          {!selectedMainCategory ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-2"
            >
              <View className="flex-row space-x-2">
                <TouchableOpacity
                  onPress={() => {
                    // Handle add new category
                    console.log("Add new category");
                  }}
                  className="px-4 py-2 rounded-full bg-gray-100"
                >
                  <Text className="text-gray-500">+ Add new Category</Text>
                </TouchableOpacity>
                {Object.keys(categories).map((mainCategory) => (
                  <TouchableOpacity
                    key={mainCategory}
                    onPress={() => handleMainCategoryPress(mainCategory)}
                    className="px-4 py-2 rounded-full bg-gray-200"
                  >
                    <Text className="text-gray-700">{mainCategory}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          ) : (
            <View>
              <View className="mb-2">
                <TouchableOpacity
                  onPress={() => handleMainCategoryPress(selectedMainCategory)}
                  className="px-4 py-2 rounded-full bg-blue-500"
                >
                  <Text className="text-white">{selectedMainCategory}</Text>
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row space-x-2">
                  <TouchableOpacity
                    onPress={() => {
                      // Handle add new subcategory
                      console.log("Add new subcategory");
                    }}
                    className="px-4 py-2 rounded-full bg-gray-100"
                  >
                    <Text className="text-gray-500">+ Add new SubCategory</Text>
                  </TouchableOpacity>
                  {categories[selectedMainCategory]?.map((subCategory) => (
                    <TouchableOpacity
                      key={subCategory}
                      onPress={() => setSelectedSubCategory(subCategory)}
                      className={`px-4 py-2 rounded-full ${
                        selectedSubCategory === subCategory
                          ? "bg-green-500"
                          : "bg-gray-100"
                      }`}
                    >
                      <Text
                        className={`${
                          selectedSubCategory === subCategory
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        {subCategory}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
