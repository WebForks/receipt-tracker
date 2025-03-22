import React, { useEffect, useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "~/utils/supabase";
import "~/global.css";

export default function Index() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // State for receipts data and pagination
  const [receipts, setReceipts] = useState([]);
  const [isReceiptsLoading, setIsReceiptsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const receiptsLimit = 20;

  // State to control the drop-up menu visibility.
  const [showDropUp, setShowDropUp] = useState(false);

  useEffect(() => {
    checkSession();

    // Subscribe to auth changes so that if the user logs out we can react immediately.
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsSignedIn(!!session);
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
      // Load initial receipts if a session exists.
      fetchReceipts();
    } else {
      setIsSignedIn(false);
    }

    setIsLoading(false);
  }

  async function fetchReceipts() {
    if (isReceiptsLoading) return; // Prevent duplicate calls

    setIsReceiptsLoading(true);
    // Use the current number of receipts as the offset
    const offset = receipts.length;

    const { data, error } = await supabase
      .from("receipts")
      .select("title, total_cost, category, date")
      .eq("completed", true)
      .order("date", { ascending: false })
      .range(offset, offset + receiptsLimit - 1);

    if (error) {
      console.error("Error fetching receipts:", error);
    } else if (data) {
      // Append the new data to the existing receipts
      setReceipts((prev) => [...prev, ...data]);
      // If fewer than the limit were returned, we've reached the end.
      if (data.length < receiptsLimit) {
        setHasMore(false);
      }
    }
    setIsReceiptsLoading(false);
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
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text className="text-xl font-bold mb-4">
          Welcome to your Dashboard!
        </Text>

        {receipts.map((receipt, index) => {
          // Create a Date object and format it to "Month Day, Year"
          const receiptDate = new Date(receipt.date);
          const formattedDate = receiptDate.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          });
          // Only show the date header if this is the first receipt or if the previous receipt's date differs.
          const showDateHeader =
            index === 0 ||
            new Date(receipts[index - 1].date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            }) !== formattedDate;

          return (
            <View key={index}>
              {showDateHeader && (
                <Text className="text-lg font-bold mb-2 mt-4">
                  {formattedDate}
                </Text>
              )}
              <View className="border border-gray-300 rounded-md p-4 mb-4">
                <Text className="text-lg font-semibold">{receipt.title}</Text>
                <Text className="text-gray-700">
                  Category: {receipt.category || "None"}
                </Text>
                <Text className="text-gray-700">
                  Total Cost: ${receipt.total_cost}
                </Text>
              </View>
            </View>
          );
        })}

        {isReceiptsLoading && <ActivityIndicator size="small" />}

        {hasMore && !isReceiptsLoading && (
          <TouchableOpacity
            onPress={fetchReceipts}
            className="bg-blue-500 px-4 py-3 rounded-lg mb-6"
          >
            <Text className="text-white text-center">Load More</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Fixed plus button in bottom-right corner */}
      <View className="absolute bottom-6 right-6">
        <TouchableOpacity
          onPress={() => setShowDropUp(!showDropUp)}
          className="bg-green-500 px-4 py-3 rounded-full shadow-lg"
        >
          <Text className="text-black font-bold">+</Text>
        </TouchableOpacity>
      </View>

      {/* Drop-up menu (green and slightly bigger) */}
      {showDropUp && (
        <View className="absolute bottom-20 right-6 bg-green-500 border border-green-700 rounded-lg shadow-lg">
          <TouchableOpacity
            onPress={() => {
              setShowDropUp(false);
              router.push("/(sub-home)/camera");
            }}
            className="px-6 py-3"
          >
            <Text className="text-black font-bold text-lg">Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setShowDropUp(false);
              router.push("/(sub-home)/manual-noai");
            }}
            className="px-6 py-3 border-t border-green-700"
          >
            <Text className="text-black font-bold text-lg">Manual</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
