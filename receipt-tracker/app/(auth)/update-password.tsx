import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View, Alert } from "react-native";
import { supabase } from "../../utils/supabase";
import { useRouter } from "expo-router";
import "~/global.css";

export default function UpdatePasswordScreen() {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleUpdatePassword() {
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Your password has been updated.");
      router.replace("/signin");
    }

    setLoading(false);
  }

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <Text className="text-2xl font-bold mb-8">Change Password</Text>

      <TextInput
        className="w-full border border-gray-300 rounded-lg p-3 mb-4 text-base"
        placeholder="Enter new password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />

      <TouchableOpacity
        className={`w-full p-3 rounded-lg items-center ${
          loading ? "bg-gray-400" : "bg-green-500"
        }`}
        disabled={loading}
        onPress={handleUpdatePassword}
      >
        <Text className="text-white font-semibold">Update Password</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-4"
        onPress={() => router.replace("/signin")}
      >
        <Text className="text-blue-500">Back to Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}
