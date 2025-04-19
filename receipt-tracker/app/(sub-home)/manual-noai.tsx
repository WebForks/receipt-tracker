import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Dimensions,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import "~/global.css";
import { supabase } from "~/utils/supabase";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";

interface ProfileData {
  categories?: Record<string, string[]>;
  "accounts-and-cards"?: Record<string, string[]>;
  [key: string]: any;
}

export default function Manual() {
  const router = useRouter();
  // We no longer use receiptId since we're inserting a new record.
  // const { receiptId } = useLocalSearchParams();

  const [formData, setFormData] = useState({
    title: "",
    note: "",
    date: "",
    total_cost: "",
  });

  // New state to control the receipt date picker
  const [isReceiptDatePickerVisible, setIsReceiptDatePickerVisible] =
    useState(false);

  // Categories state (existing)
  const [selectedMainCategory, setSelectedMainCategory] = useState<
    string | null
  >(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(
    null
  );
  const [isAddCategoryModalVisible, setIsAddCategoryModalVisible] =
    useState(false);
  const [isAddSubCategoryModalVisible, setIsAddSubCategoryModalVisible] =
    useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubCategoryName, setNewSubCategoryName] = useState("");
  const [categories, setCategories] = useState<Record<string, string[]>>({});

  // New state for Accounts
  const [accounts, setAccounts] = useState<Record<string, string[]>>({});
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [isAddAccountModalVisible, setIsAddAccountModalVisible] =
    useState(false);
  const [newAccountName, setNewAccountName] = useState("");

  // Repeating states
  const [isRepeating, setIsRepeating] = useState(false);
  const [frequencyNumber, setFrequencyNumber] = useState("1");
  const [frequencyUnit, setFrequencyUnit] = useState("month"); // Options: day, week, month, year
  const [untilDate, setUntilDate] = useState("Forever");
  const [isUnitModalVisible, setIsUnitModalVisible] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  // Dynamic container padding based on screen height
  const screenHeight = Dimensions.get("window").height;
  const containerPadding = screenHeight < 700 ? 10 : 20;

  // Add this state
  const [isSaving, setIsSaving] = useState(false);

  // Add useEffect to monitor formData.date changes
  useEffect(() => {
    console.log("formData.date changed:", formData.date);
  }, [formData.date]);

  // Fetch categories and accounts from profiles table
  useEffect(() => {
    async function fetchData() {
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

        // Fetch categories and accounts-and-cards from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("categories, accounts-and-cards")
          .eq("user_id", userData.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile data:", profileError.message);
          return;
        }
        console.log("profileData", profileData);
        // Set categories and accounts if they exist, otherwise use empty objects
        if ("categories" in profileData) {
          setCategories(profileData.categories as Record<string, string[]>);
        } else {
          setCategories({});
        }
        if ("accounts-and-cards" in profileData) {
          setAccounts(
            profileData["accounts-and-cards"] as Record<string, string[]>
          );
        } else {
          setAccounts({});
        }
      } catch (err) {
        console.error("Error in fetchData:", err);
      }
    }
    fetchData();
  }, []);

  // Removed AI response parsing. Now the form solely relies on the user's manual input.

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert("Error", "Category name cannot be empty");
      return;
    }
    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData?.user) throw new Error("No user logged in");

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("categories")
        .eq("user_id", userData.user.id)
        .single();
      if (profileError) throw profileError;

      if (
        profileData?.categories &&
        newCategoryName in profileData.categories
      ) {
        Alert.alert("Error", "Category already exists");
        return;
      }

      const updatedCategories = {
        ...profileData?.categories,
        [newCategoryName]: [],
      };

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ categories: updatedCategories })
        .eq("user_id", userData.user.id);
      if (updateError) throw updateError;

      setCategories(updatedCategories);
      setNewCategoryName("");
      setIsAddCategoryModalVisible(false);
      Alert.alert("Success", "Category added successfully");
    } catch (error) {
      console.error("Error adding category:", error);
      Alert.alert("Error", "Failed to add category");
    }
  };

  const handleAddSubCategory = async () => {
    if (!newSubCategoryName.trim()) {
      Alert.alert("Error", "Subcategory name cannot be empty");
      return;
    }
    if (!selectedMainCategory) {
      Alert.alert("Error", "No category selected");
      return;
    }
    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData?.user) throw new Error("No user logged in");

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("categories")
        .eq("user_id", userData.user.id)
        .single();
      if (profileError) throw profileError;

      if (
        profileData?.categories[selectedMainCategory]?.includes(
          newSubCategoryName
        )
      ) {
        Alert.alert("Error", "Subcategory already exists");
        return;
      }

      const updatedCategories = {
        ...profileData?.categories,
        [selectedMainCategory]: [
          ...(profileData?.categories[selectedMainCategory] || []),
          newSubCategoryName,
        ],
      };

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ categories: updatedCategories })
        .eq("user_id", userData.user.id);
      if (updateError) throw updateError;

      setCategories(updatedCategories);
      setNewSubCategoryName("");
      setIsAddSubCategoryModalVisible(false);
      Alert.alert("Success", "Subcategory added successfully");
    } catch (error) {
      console.error("Error adding subcategory:", error);
      Alert.alert("Error", "Failed to add subcategory");
    }
  };

  // New functions for Accounts
  const handleAddAccount = async () => {
    if (!newAccountName.trim()) {
      Alert.alert("Error", "Account name cannot be empty");
      return;
    }
    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData?.user) throw new Error("No user logged in");

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("accounts-and-cards")
        .eq("user_id", userData.user.id)
        .single();
      if (profileError) throw profileError;
      if (
        profileData &&
        typeof profileData === "object" &&
        "accounts-and-cards" in profileData &&
        Object.hasOwn(
          profileData["accounts-and-cards"] as Record<string, string[]>,
          newAccountName
        )
      ) {
        Alert.alert("Error", "Account already exists");
        return;
      }

      const updatedAccounts: Record<string, string[]> = {};

      if (
        profileData &&
        typeof profileData === "object" &&
        "accounts-and-cards" in profileData
      ) {
        const accountsAndCards = profileData["accounts-and-cards"] as Record<
          string,
          string[]
        >;
        Object.assign(updatedAccounts, accountsAndCards);
      }

      updatedAccounts[newAccountName] = [];

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ "accounts-and-cards": updatedAccounts })
        .eq("user_id", userData.user.id);
      if (updateError) throw updateError;

      setAccounts(updatedAccounts as Record<string, string[]>);
      setNewAccountName("");
      setIsAddAccountModalVisible(false);
      Alert.alert("Success", "Account added successfully");
    } catch (error) {
      console.error("Error adding account:", error);
      Alert.alert("Error", "Failed to add account");
    }
  };

  // The form now relies solely on user input.
  const handleMainCategoryPress = (category: string) => {
    if (selectedMainCategory === category) {
      setSelectedMainCategory(null);
      setSelectedSubCategory(null);
    } else {
      setSelectedMainCategory(category);
      setSelectedSubCategory(null);
    }
  };

  const handleSubCategoryPress = (subCategory: string) => {
    if (selectedSubCategory === subCategory) {
      setSelectedSubCategory(null);
    } else {
      setSelectedSubCategory(subCategory);
    }
  };

  // Handler for Accounts
  const handleAccountPress = (account: string) => {
    if (selectedAccount === account) {
      setSelectedAccount(null);
    } else {
      setSelectedAccount(account);
    }
  };

  // Save function to insert a new receipt based on user input
  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Validate required fields
      if (!formData.title.trim()) {
        Alert.alert("Error", "Title is required");
        setIsSaving(false);
        return;
      }

      if (!formData.date) {
        Alert.alert("Error", "Date is required");
        setIsSaving(false);
        return;
      }

      if (!formData.total_cost.trim()) {
        Alert.alert("Error", "Total cost is required");
        setIsSaving(false);
        return;
      }

      // Get current user
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData?.user) throw new Error("No user logged in");

      // Combine the selected date with the current time
      const [year, month, day] = formData.date.split("-").map(Number);
      let updatedDate = new Date(year, month - 1, day); // months are 0-indexed in JS
      const now = new Date();
      updatedDate.setHours(
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
        now.getMilliseconds()
      );
      console.log("updatedDate", updatedDate);

      const computedRepeatFrequency = `${frequencyNumber} ${frequencyUnit} until ${untilDate}`;
      console.log("computedRepeatFrequency", computedRepeatFrequency);

      // Calculate next_run date
      const nextRunDate = new Date(updatedDate);
      if (frequencyUnit.toLowerCase() === "month") {
        nextRunDate.setMonth(nextRunDate.getMonth() + Number(frequencyNumber));
      } else if (frequencyUnit.toLowerCase() === "year") {
        nextRunDate.setFullYear(
          nextRunDate.getFullYear() + Number(frequencyNumber)
        );
      } else if (frequencyUnit.toLowerCase() === "week") {
        nextRunDate.setDate(
          nextRunDate.getDate() + Number(frequencyNumber) * 7
        );
      } else if (frequencyUnit.toLowerCase() === "day") {
        nextRunDate.setDate(nextRunDate.getDate() + Number(frequencyNumber));
      }

      // Calculate end_date
      let endDate;
      if (untilDate === "Forever") {
        endDate = new Date("2300-01-01");
      } else {
        const [month, day, year] = untilDate.split("/");
        endDate = new Date(Number(year), Number(month) - 1, Number(day)); // month is 0-based
        const lastRunTime = new Date(updatedDate);
        endDate.setHours(lastRunTime.getHours());
        endDate.setMinutes(lastRunTime.getMinutes());
        endDate.setSeconds(lastRunTime.getSeconds());
        endDate.setMilliseconds(lastRunTime.getMilliseconds());
      }

      // Check if end_date is before next_run
      if (isRepeating && endDate < nextRunDate) {
        setIsSaving(false);
        Alert.alert(
          "Warning",
          "The end date is before the next subscription run. This means the subscription will not occur again. Do you want to continue anyway?",
          [
            {
              text: "Go Back",
              style: "cancel",
              onPress: () => {
                // Do nothing, just go back to the form
              },
            },
            {
              text: "Continue Anyway",
              onPress: () => {
                // Continue with saving
                saveReceiptAndSubscription(
                  userData.user.id,
                  updatedDate,
                  nextRunDate,
                  endDate
                );
              },
            },
          ]
        );
        return;
      }

      // If we get here, either the end_date is after next_run or it's not a repeating payment
      await saveReceiptAndSubscription(
        userData.user.id,
        updatedDate,
        nextRunDate,
        endDate
      );
    } catch (error) {
      console.error("Error saving receipt:", error);
      Alert.alert("Error", "Failed to save receipt");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to save receipt and subscription
  const saveReceiptAndSubscription = async (
    userId: string,
    updatedDate: Date,
    nextRunDate: Date,
    endDate: Date
  ) => {
    try {
      // Validate and format total cost
      let formattedTotalCost;
      try {
        // Only allow numbers and decimal point
        const numericValue = formData.total_cost.replace(/[^0-9.]/g, "");
        // Ensure only one decimal point
        const parts = numericValue.split(".");
        const formattedValue =
          parts.length > 2
            ? parts[0] + "." + parts.slice(1).join("")
            : numericValue;

        // Check if it's a valid number
        const parsedValue = parseFloat(formattedValue);
        if (isNaN(parsedValue)) {
          Alert.alert("Error", "Total cost must be a valid number");
          return;
        }

        formattedTotalCost = Number(parsedValue.toFixed(2));
      } catch (error) {
        console.error("Error formatting total cost:", error);
        Alert.alert("Error", "Total cost must be a valid number");
        return;
      }

      // Insert new receipt record into the database including user_id
      const { data: receiptData, error: receiptsError } = await supabase
        .from("receipts")
        .insert({
          user_id: userId,
          title: formData.title,
          note: formData.note,
          date: updatedDate.toISOString(),
          total_cost: formattedTotalCost,
          category: selectedMainCategory || "",
          subcategory: selectedSubCategory || "",
          account: selectedAccount,
          repeating: isRepeating,
          completed: true,
          date_added_to_db: new Date().toISOString(),
        })
        .select();
      if (receiptsError) throw receiptsError;

      console.log("untilDate:", untilDate);
      console.log("isRepeating:", isRepeating);

      const { data: subscriptionsData, error: subscriptionsError } =
        await supabase
          .from("subscriptions")
          .insert({
            user_id: userId,
            receipt_id: (
              await supabase
                .from("receipts")
                .select("id")
                .eq("user_id", userId)
                .order("created_at", { ascending: false })
                .limit(1)
                .single()
            ).data?.id,
            repeating_month:
              frequencyUnit.toLowerCase() === "month"
                ? Number(frequencyNumber)
                : 0,
            repeating_year:
              frequencyUnit.toLowerCase() === "year"
                ? Number(frequencyNumber)
                : 0,
            repeating_week:
              frequencyUnit.toLowerCase() === "week"
                ? Number(frequencyNumber)
                : 0,
            repeating_day:
              frequencyUnit.toLowerCase() === "day"
                ? Number(frequencyNumber)
                : 0,
            end_date: endDate.toISOString(),
            last_run: updatedDate.toISOString(),
            next_run: nextRunDate.toISOString(),
            active: true,
          })
          .select();
      if (subscriptionsError) throw subscriptionsError;
      console.log("subscriptionsData", subscriptionsData);

      // Link the subscription ID to the receipt
      const { error: receiptUpdateError } = await supabase
        .from("receipts")
        .update({ subscription_id: subscriptionsData[0].id })
        .eq("id", receiptData[0].id);
      if (receiptUpdateError) throw receiptUpdateError;

      router.push({ pathname: "/(tabs)" });
      Alert.alert("Success", "Receipt saved successfully");
    } catch (error) {
      console.error("Error saving receipt:", error);
      Alert.alert("Error", "Failed to save receipt");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Scrollable form content */}
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: containerPadding,
          paddingBottom: 120, // Extra space so content isn't hidden behind the fixed button
        }}
      >
        <View className="justify-center items-center mb-6">
          <View className="flex-row items-center w-full">
            <TouchableOpacity
              onPress={() => router.back()}
              className="absolute left-0 z-10 p-2"
            >
              <Text className="text-black text-2xl font-bold">←</Text>
            </TouchableOpacity>
            <Text className="text-xl font-bold text-black flex-1 text-center">
              Manual Entry
            </Text>
          </View>
        </View>

        <View className="space-y-4 flex-1">
          {/* Title */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Title <Text className="text-red-500">*</Text>
            </Text>
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

          {/* Note */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">Note</Text>
            <View
              className="w-full border border-gray-300 rounded-md bg-white"
              style={{ minHeight: 100 }}
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
                />
              </ScrollView>
            </View>
          </View>

          {/* Date Field: Pop-up Date Picker */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Date <Text className="text-red-500">*</Text>
            </Text>
            <TouchableOpacity
              onPress={() => setIsReceiptDatePickerVisible(true)}
              className="w-full border border-gray-300 rounded-md p-2 bg-white flex-row justify-between items-center"
            >
              <Text className="text-black">
                {formData.date
                  ? (() => {
                      try {
                        // Parse the date string manually to avoid timezone issues
                        const [year, month, day] = formData.date
                          .split("-")
                          .map(Number);
                        const dateObj = new Date(year, month - 1, day);
                        return dateObj.toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        });
                      } catch (error) {
                        console.error("Error formatting date:", error);
                        return "Invalid Date";
                      }
                    })()
                  : "Select Date"}
              </Text>
              <Text className="text-gray-500">📅</Text>
            </TouchableOpacity>
          </View>

          {/* Total Cost */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Total Cost <Text className="text-red-500">*</Text>
            </Text>
            <View className="flex-row items-center border border-gray-300 rounded-md bg-white">
              <Text className="text-black p-2">$</Text>
              <TextInput
                className="flex-1 p-2 text-black"
                value={formData.total_cost}
                onChangeText={(text) => {
                  // Allow any input, we'll validate later
                  setFormData((prev) => ({
                    ...prev,
                    total_cost: text,
                  }));
                }}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
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
                    onPress={() => setIsAddCategoryModalVisible(true)}
                    className="px-4 py-2 rounded-full bg-blue-100 border border-blue-300"
                  >
                    <Text className="text-blue-600">+ Add new</Text>
                  </TouchableOpacity>
                  {Object.keys(categories).map((mainCategory) => (
                    <TouchableOpacity
                      key={mainCategory}
                      onPress={() => handleMainCategoryPress(mainCategory)}
                      className="px-4 py-2 rounded-full bg-gray-200 border border-gray-300"
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
                    onPress={() =>
                      handleMainCategoryPress(selectedMainCategory)
                    }
                    className="px-4 py-2 rounded-full bg-blue-500 w-auto flex-row items-center"
                    style={{ alignSelf: "flex-start" }}
                  >
                    <Text className="text-white mr-2">
                      {selectedMainCategory}
                    </Text>
                    <Text className="text-white">✕</Text>
                  </TouchableOpacity>
                </View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Subcategory
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {selectedSubCategory === null ? (
                    <View className="flex-row space-x-2">
                      <TouchableOpacity
                        onPress={() => setIsAddSubCategoryModalVisible(true)}
                        className="px-4 py-2 rounded-full bg-green-100 border border-green-300"
                      >
                        <Text className="text-green-600">+ Add new</Text>
                      </TouchableOpacity>
                      {categories[selectedMainCategory]?.map((subCategory) => (
                        <TouchableOpacity
                          key={subCategory}
                          onPress={() => handleSubCategoryPress(subCategory)}
                          className="px-4 py-2 rounded-full bg-gray-100 border border-gray-300"
                        >
                          <Text className="text-gray-700">{subCategory}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <View className="flex-row space-x-2">
                      <TouchableOpacity
                        onPress={() =>
                          handleSubCategoryPress(selectedSubCategory)
                        }
                        className="px-4 py-2 rounded-full bg-green-500 flex-row items-center"
                      >
                        <Text className="text-white mr-2">
                          {selectedSubCategory}
                        </Text>
                        <Text className="text-white">✕</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Accounts Section */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Accounts
            </Text>
            {!selectedAccount ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-2"
              >
                <View className="flex-row space-x-2">
                  <TouchableOpacity
                    onPress={() => setIsAddAccountModalVisible(true)}
                    className="px-4 py-2 rounded-full bg-gray-100"
                  >
                    <Text className="text-gray-500">+ Add new</Text>
                  </TouchableOpacity>
                  {Object.keys(accounts).map((account) => (
                    <TouchableOpacity
                      key={account}
                      onPress={() => handleAccountPress(account)}
                      className="px-4 py-2 rounded-full bg-gray-200"
                    >
                      <Text className="text-gray-700">{account}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            ) : (
              <View className="mb-2" style={{ alignSelf: "flex-start" }}>
                <TouchableOpacity
                  onPress={() => handleAccountPress(selectedAccount)}
                  className="px-4 py-2 rounded-full bg-blue-500"
                >
                  <Text className="text-white">{selectedAccount}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {isDatePickerVisible && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setIsDatePickerVisible(false);
                if (selectedDate) {
                  // Format date as mm/dd/yyyy for repeating until date
                  const formattedDate = `${
                    selectedDate.getMonth() + 1
                  }/${selectedDate.getDate()}/${selectedDate.getFullYear()}`;
                  setUntilDate(formattedDate);
                }
              }}
            />
          )}

          {/* Receipt Date Picker */}
          {isReceiptDatePickerVisible && (
            <DateTimePicker
              value={formData.date ? new Date(formData.date) : new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                console.log("Date picker event:", event);
                console.log("Selected date:", selectedDate);
                console.log("Current formData:", formData);

                // Always hide the picker first
                setIsReceiptDatePickerVisible(false);

                // Only update the date if a date was actually selected
                if (selectedDate) {
                  // Format date as YYYY-MM-DD for the receipt
                  const year = selectedDate.getFullYear();
                  const month = String(selectedDate.getMonth() + 1).padStart(
                    2,
                    "0"
                  );
                  const day = String(selectedDate.getDate()).padStart(2, "0");
                  const formattedDate = `${year}-${month}-${day}`;

                  console.log("Formatted date:", formattedDate);

                  // Update the form data with the new date
                  setFormData((prev) => {
                    const newFormData = { ...prev, date: formattedDate };
                    console.log("Updated formData:", newFormData);
                    return newFormData;
                  });
                }
              }}
            />
          )}

          {/* Repeating Section */}
          <View>
            <TouchableOpacity
              onPress={() => setIsRepeating(!isRepeating)}
              style={{ flexDirection: "row", alignItems: "center" }}
              className="mb-2"
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderWidth: 2,
                  borderColor: isRepeating ? "#3B82F6" : "gray",
                  backgroundColor: isRepeating ? "#3B82F6" : "white",
                  marginRight: 8,
                  borderRadius: 4,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {isRepeating && <Text className="text-white">✓</Text>}
              </View>
              <Text className="text-sm font-medium text-gray-700">
                Repeating Payment
              </Text>
            </TouchableOpacity>

            {isRepeating && (
              <View className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                <Text className="text-sm font-medium text-blue-800 mb-2">
                  Repeat every
                </Text>
                <View className="flex-row items-center space-x-2 mb-3">
                  <TextInput
                    value={frequencyNumber}
                    onChangeText={setFrequencyNumber}
                    keyboardType="number-pad"
                    className="border border-gray-300 rounded-md p-2 text-black bg-white w-16 text-center"
                    placeholder="1"
                  />
                  <TouchableOpacity
                    onPress={() => setIsUnitModalVisible(true)}
                    className="px-4 py-2 rounded-md bg-white border border-gray-300"
                  >
                    <Text className="text-gray-700 capitalize">
                      {frequencyUnit}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text className="text-sm font-medium text-blue-800 mb-2">
                  Until
                </Text>
                <TouchableOpacity
                  onPress={() => setIsDatePickerVisible(true)}
                  className="px-4 py-2 rounded-md bg-white border border-gray-300 flex-row justify-between items-center"
                >
                  <Text className="text-gray-700">{untilDate}</Text>
                  <Text className="text-gray-500">📅</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Fixed Save Button at the bottom */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-white">
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          className={`px-6 py-4 rounded-md ${
            isSaving ? "bg-gray-400" : "bg-green-500"
          }`}
        >
          {isSaving ? (
            <View className="flex-row justify-center items-center">
              <Text className="text-white mr-2">Saving...</Text>
              <View className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></View>
            </View>
          ) : (
            <Text className="text-white text-center text-lg">Save</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isAddCategoryModalVisible}
        onRequestClose={() => setIsAddCategoryModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-lg w-[80%]">
            <Text className="text-lg font-bold mb-4">Add New Category</Text>
            <TextInput
              className="border border-gray-300 rounded-md p-2 mb-4"
              placeholder="Enter category name"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              autoFocus
            />
            <View className="flex-row justify-end space-x-2">
              <TouchableOpacity
                onPress={() => {
                  setIsAddCategoryModalVisible(false);
                  setNewCategoryName("");
                }}
                className="px-4 py-2 rounded-md bg-gray-200"
              >
                <Text className="text-gray-700">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddCategory}
                className="px-4 py-2 rounded-md bg-blue-500"
              >
                <Text className="text-white">Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isAddSubCategoryModalVisible}
        onRequestClose={() => setIsAddSubCategoryModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-lg w-[80%]">
            <Text className="text-lg font-bold mb-4">Add New Subcategory</Text>
            <TextInput
              className="border border-gray-300 rounded-md p-2 mb-4"
              placeholder="Enter subcategory name"
              value={newSubCategoryName}
              onChangeText={setNewSubCategoryName}
              autoFocus
            />
            <View className="flex-row justify-end space-x-2">
              <TouchableOpacity
                onPress={() => {
                  setIsAddSubCategoryModalVisible(false);
                  setNewSubCategoryName("");
                }}
                className="px-4 py-2 rounded-md bg-gray-200"
              >
                <Text className="text-gray-700">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddSubCategory}
                className="px-4 py-2 rounded-md bg-blue-500"
              >
                <Text className="text-white">Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isAddAccountModalVisible}
        onRequestClose={() => setIsAddAccountModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-lg w-[80%]">
            <Text className="text-lg font-bold mb-4">Add New Account</Text>
            <TextInput
              className="border border-gray-300 rounded-md p-2 mb-4"
              placeholder="Enter account name"
              value={newAccountName}
              onChangeText={setNewAccountName}
              autoFocus
            />
            <View className="flex-row justify-end space-x-2">
              <TouchableOpacity
                onPress={() => {
                  setIsAddAccountModalVisible(false);
                  setNewAccountName("");
                }}
                className="px-4 py-2 rounded-md bg-gray-200"
              >
                <Text className="text-gray-700">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddAccount}
                className="px-4 py-2 rounded-md bg-blue-500"
              >
                <Text className="text-white">Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {isUnitModalVisible && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={isUnitModalVisible}
        >
          <TouchableOpacity
            onPress={() => setIsUnitModalVisible(false)}
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View className="bg-white p-4 rounded-lg">
              {["day", "week", "month", "year"].map((unit) => (
                <TouchableOpacity
                  key={unit}
                  onPress={() => {
                    setFrequencyUnit(unit);
                    setIsUnitModalVisible(false);
                  }}
                  className="p-2"
                >
                  <Text className="text-gray-700 capitalize">{unit}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}
