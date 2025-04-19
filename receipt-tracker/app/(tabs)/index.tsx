import React, { useEffect, useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "~/utils/supabase";
import "~/global.css";

export default function Index() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // State for receipts data and pagination
  const [receipts, setReceipts] = useState<
    Array<{
      title: string;
      total_cost: number;
      category?: string;
      date: string;
    }>
  >([]);
  const [isReceiptsLoading, setIsReceiptsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const receiptsLimit = 20;
  const [sortBy, setSortBy] = useState<"date" | "date_added_to_db">("date");

  // State to control the drop-up menu visibility.
  const [showDropUp, setShowDropUp] = useState(false);

  // State to control the sort dropdown visibility.
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Add pull-to-refresh functionality to ScrollView
  const [refreshing, setRefreshing] = useState(false);

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

  async function fetchReceipts(forcedOffset?: number) {
    if (isReceiptsLoading) return; // Prevent duplicate calls

    setIsReceiptsLoading(true);
    const offset = forcedOffset !== undefined ? forcedOffset : receipts.length;
    console.log("sortBy fetchReceipts", sortBy);
    console.log("offset before fetchReceipts", offset);
    const { data, error } = await supabase
      .from("receipts")
      .select("title, total_cost, category, date, date_added_to_db")
      .eq("completed", true)
      .order(sortBy, { ascending: false })
      .range(offset, offset + receiptsLimit - 1);
    console.log("data fetchReceipts", data);
    console.log("offset after fetchReceipts", offset);

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

  // Add useEffect to refetch receipts when sortBy changes
  useEffect(() => {
    if (isSignedIn) {
      setReceipts([]); // Clear existing receipts
      setHasMore(true); // Reset hasMore
      fetchReceipts(0); // Fetch with new sort, forcing offset to 0
    }
  }, [sortBy]);

  // Add a loading skeleton while receipts are being fetched
  const ReceiptSkeleton = () => (
    <View className="border border-gray-300 rounded-md p-4 mb-4 animate-pulse">
      <View className="h-6 bg-gray-200 rounded w-3/4 mb-2"></View>
      <View className="h-4 bg-gray-200 rounded w-1/2 mb-2"></View>
      <View className="h-4 bg-gray-200 rounded w-1/3"></View>
    </View>
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    setReceipts([]);
    setHasMore(true);
    await fetchReceipts(0);
    setRefreshing(false);
  }, []);

  // Add a friendly empty state when no receipts exist
  const EmptyState = () => (
    <View className="flex-1 justify-center items-center py-8">
      <Text className="text-xl font-semibold text-gray-600 mb-2">
        No Receipts Yet
      </Text>
      <Text className="text-gray-500 text-center mb-4">
        Start tracking your expenses by adding your first receipt
      </Text>
      <TouchableOpacity
        onPress={() => setShowDropUp(true)}
        className="bg-green-500 px-6 py-3 rounded-lg"
      >
        <Text className="text-white font-semibold">Add Receipt</Text>
      </TouchableOpacity>
    </View>
  );

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
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text className="text-xl font-bold mb-4">
          Welcome to your Dashboard!
        </Text>

        {/* Sort Dropdown */}
        <View className="mb-4">
          <TouchableOpacity
            onPress={() => setShowSortDropdown(!showSortDropdown)}
            className="bg-gray-100 px-4 py-2 rounded-lg flex-row justify-between items-center"
          >
            <Text className="text-gray-700">
              Sort by: {sortBy === "date" ? "Receipt Date" : "Date Added"}
            </Text>
            <Text className="text-gray-500">▼</Text>
          </TouchableOpacity>

          {showSortDropdown && (
            <View className="absolute top-12 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <TouchableOpacity
                onPress={() => {
                  setSortBy("date");
                  setShowSortDropdown(false);
                }}
                className="px-4 py-3 border-b border-gray-100"
              >
                <Text className="text-gray-700">Receipt Date</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setSortBy("date_added_to_db");
                  setShowSortDropdown(false);
                }}
                className="px-4 py-3"
              >
                <Text className="text-gray-700">Date Added</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {receipts.length === 0 && !isReceiptsLoading ? (
          <EmptyState />
        ) : (
          receipts.map((receipt, index) => {
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
          })
        )}

        {isReceiptsLoading && <ActivityIndicator size="small" />}

        {hasMore && !isReceiptsLoading && (
          <TouchableOpacity
            onPress={() => fetchReceipts()}
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
