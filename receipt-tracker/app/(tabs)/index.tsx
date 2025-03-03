import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "~/utils/supabase";
import "~/global.css";

export default function Index() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    checkSession();

    // Subscribe to auth changes, so if the user logs out we can react immediately.
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setIsSignedIn(true);
        } else {
          setIsSignedIn(false);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function checkSession() {
    const { data } = await supabase.auth.getSession();

    if (data.session) {
      setIsSignedIn(true);
    } else {
      setIsSignedIn(false);
    }

    setIsLoading(false);
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (!isSignedIn) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-xl font-bold mb-6">Welcome to the App!</Text>
        <TouchableOpacity
          onPress={() => router.replace("/signin")}
          className="bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-xl font-bold mb-4">Welcome to your Dashboard!</Text>
    </View>
  );
}
