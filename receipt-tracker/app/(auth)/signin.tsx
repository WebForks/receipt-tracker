import React, { useState, useEffect } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  AppState,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "~/utils/supabase";
import "~/global.css";

export default function SignInScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Start/stop auto-refresh based on app state (like the original example)
  useEffect(() => {
    const listener = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });

    return () => listener.remove();
  }, []);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert("Login failed", error.message);
    } else {
      Alert.alert("Success", "You are now signed in!");
      router.replace("/(tabs)"); // Redirect to home or dashboard after successful login
    }
    setLoading(false);
  }

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <Text className="text-2xl font-bold mb-8">Sign In</Text>

      <TextInput
        className="w-full border border-gray-300 rounded-lg p-3 mb-4 text-base"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        className="w-full border border-gray-300 rounded-lg p-3 mb-4 text-base"
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        className={`w-full p-3 rounded-lg items-center mb-4 ${
          loading ? "bg-gray-400" : "bg-blue-500"
        }`}
        disabled={loading}
        onPress={signInWithEmail}
      >
        <Text className="text-white font-semibold">Sign In</Text>
      </TouchableOpacity>

      <View className="flex-row justify-between w-full mt-2">
        <TouchableOpacity onPress={() => router.push("/signup")}>
          <Text className="text-blue-500">Sign Up Now</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/forgot-password")}>
          <Text className="text-blue-500">Forgot Password?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
