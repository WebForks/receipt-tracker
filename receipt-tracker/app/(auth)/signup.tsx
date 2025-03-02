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
import { supabase } from "../../utils/supabase";
import "~/global.css";

export default function SignUpScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

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

  async function signUpWithEmail() {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error, data } = await supabase.auth.signUp({ email, password });

    if (error) {
      Alert.alert("Sign Up Failed", error.message);
    } else if (!data.session) {
      Alert.alert(
        "Verification",
        "Please check your email for a confirmation link.  Check your spam folder if you don't see it in your inbox."
      );
      router.replace("/signin"); // Go back to signin after signup
    }
    setLoading(false);
  }

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <Text className="text-2xl font-bold mb-8">Sign Up</Text>

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

      <TextInput
        className="w-full border border-gray-300 rounded-lg p-3 mb-4 text-base"
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity
        className={`w-full p-3 rounded-lg items-center mb-4 ${
          loading ? "bg-gray-400" : "bg-green-500"
        }`}
        disabled={loading}
        onPress={signUpWithEmail}
      >
        <Text className="text-white font-semibold">Create Account</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-4"
        onPress={() => router.replace("/signin")}
      >
        <Text className="text-blue-500">Already have an account? Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}
