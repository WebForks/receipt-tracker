import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View, Alert } from "react-native";
import { supabase } from "../../utils/supabase";
import { useRouter } from "expo-router";
import "~/global.css";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleResetPassword() {
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "exp://localhost:8081/update-password",
      // For production, replace with your actual app link like:
      // redirectTo: "https://mycoolapp.com/update-password"
    });

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert(
        "Success",
        "Password reset email has been sent. Please check your inbox."
      );
      router.replace("/signin");
    }

    setLoading(false);
  }

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <Text className="text-2xl font-bold mb-8">Reset Password</Text>

      <TextInput
        className="w-full border border-gray-300 rounded-lg p-3 mb-4 text-base"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity
        className={`w-full p-3 rounded-lg items-center ${
          loading ? "bg-gray-400" : "bg-purple-500"
        }`}
        disabled={loading}
        onPress={handleResetPassword}
      >
        <Text className="text-white font-semibold">Send Reset Email</Text>
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
