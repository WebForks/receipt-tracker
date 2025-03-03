// In your More component (apps/(tabs)/more.tsx)
import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import "~/global.css";
import { supabase } from "~/utils/supabase";

export default function More() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);

  // Update or insert the user's theme in the profiles table based on the current user's UID.
  const updateTheme = async (theme: string) => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.log("Error fetching user:", userError.message);
      return;
    }
    if (!userData?.user) {
      console.log("No user logged in");
      return;
    }
    const uid = userData.user.id;

    // First check if a profile row exists for this user
    const { data: profileData, error: selectError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", uid)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      // If an error other than "No rows" is returned, log it.
      console.log("Error checking profile:", selectError.message);
      return;
    }

    let actionError = null;
    if (profileData) {
      // Row exists, update it
      const { error } = await supabase
        .from("profiles")
        .update({ theme })
        .eq("user_id", uid);
      actionError = error;
    } else {
      // No row exists, insert a new row
      const { error } = await supabase
        .from("profiles")
        .insert([{ user_id: uid, theme }]);
      actionError = error;
    }
    if (actionError) {
      console.log("Error updating/inserting theme:", actionError.message);
    } else {
      console.log("Theme updated to", theme);
    }
  };

  const handleLightPress = async () => {
    setIsDark(false);
    await updateTheme("light");
  };

  const handleDarkPress = async () => {
    setIsDark(true);
    await updateTheme("dark");
  };

  return (
    <View className="flex-1 justify-center items-center bg-white p-4">
      <Text className="text-xl font-bold mb-6 text-black">More Screen</Text>

      <TouchableOpacity
        onPress={() => router.push("/(sub-more)/subscriptions")}
        className="w-64 bg-blue-500 py-3 mb-4 rounded-lg"
      >
        <Text className="text-center text-white font-semibold">
          Subscriptions
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/(sub-more)/accounts-cards")}
        className="w-64 bg-blue-500 py-3 mb-4 rounded-lg"
      >
        <Text className="text-center text-white font-semibold">
          Accounts & Cards
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/(sub-more)/settings")}
        className="w-64 bg-blue-500 py-3 mb-4 rounded-lg"
      >
        <Text className="text-center text-white font-semibold">Settings</Text>
      </TouchableOpacity>

      {/* Horizontal Light/Dark toggle */}
      <View className="flex-row">
        <TouchableOpacity
          onPress={handleLightPress}
          className={`px-6 py-3 rounded-l border border-gray-300 ${
            !isDark ? "bg-blue-500" : "bg-gray-200"
          }`}
        >
          <Text
            className={`font-bold ${!isDark ? "text-white" : "text-black"}`}
          >
            Light
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleDarkPress}
          className={`px-6 py-3 rounded-r border border-gray-300 ${
            isDark ? "bg-blue-500" : "bg-gray-200"
          }`}
        >
          <Text className={`font-bold ${isDark ? "text-white" : "text-black"}`}>
            Dark
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
