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

export default function Manual() {
  const router = useRouter();
  // Get route params (assumes receiptId is passed)
  const { aiResponse, receiptId } = useLocalSearchParams();
  console.log("aiResponse", aiResponse);
  console.log("receiptId", receiptId);

  const [formData, setFormData] = useState({
    title: "",
    note: "",
    date: "",
    total_cost: "",
  });

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
        setCategories(profileData?.categories || {});
        setAccounts(profileData?.["accounts-and-cards"] || {});
      } catch (err) {
        console.error("Error in fetchData:", err);
      }
    }
    fetchData();
  }, []);

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
        profileData?.["accounts-and-cards"] &&
        newAccountName in profileData["accounts-and-cards"]
      ) {
        Alert.alert("Error", "Account already exists");
        return;
      }

      const updatedAccounts = {
        ...profileData?.["accounts-and-cards"],
        [newAccountName]: [],
      };

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ "accounts-and-cards": updatedAccounts })
        .eq("user_id", userData.user.id);
      if (updateError) throw updateError;

      setAccounts(updatedAccounts);
      setNewAccountName("");
      setIsAddAccountModalVisible(false);
      Alert.alert("Success", "Account added successfully");
    } catch (error) {
      console.error("Error adding account:", error);
      Alert.alert("Error", "Failed to add account");
    }
  };

  useEffect(() => {
    if (aiResponse) {
      try {
        const outerParsed = JSON.parse(aiResponse as string);
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

  // Save function to update receipts and profiles
  const handleSave = async () => {
    try {
      // Get current user
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData?.user) throw new Error("No user logged in");

      // Combine the selected date with the current time
      let updatedDate = new Date(formData.date);
      const now = new Date();
      updatedDate.setHours(
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
        now.getMilliseconds()
      );
      console.log("updatedDate", updatedDate);
      console.log("receiptId", receiptId);

      const computedRepeatFrequency = `${frequencyNumber} ${frequencyUnit} until ${untilDate}`;

      // Update receipts database (assuming table "receipts")
      const { error: receiptsError } = await supabase
        .from("receipts")
        .update({
          title: formData.title,
          note: formData.note,
          date: updatedDate.toISOString(),
          total_cost: Number(formData.total_cost),
          category: selectedMainCategory || "",
          subcategory: selectedSubCategory || "",
          account: selectedAccount,
          repeating: isRepeating,
          repeat_frequency: isRepeating ? computedRepeatFrequency : null,
          completed: true,
        })
        .eq("id", receiptId);

      if (receiptsError) throw receiptsError;

      // Now update the profiles table subscriptions (assumed JSON type)
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("subscriptions")
        .eq("user_id", userData.user.id)
        .single();
      if (profileError) throw profileError;

      const existingSubscriptions = profileData?.subscriptions || {};
      const updatedSubscriptions = {
        ...existingSubscriptions,
        [receiptId]: computedRepeatFrequency,
      };

      const { error: updateProfileError } = await supabase
        .from("profiles")
        .update({ subscriptions: updatedSubscriptions })
        .eq("user_id", userData.user.id);
      if (updateProfileError) throw updateProfileError;

      router.push({
        pathname: "/(tabs)",
      });

      Alert.alert("Success", "Receipt saved successfully");
    } catch (error) {
      console.error("Error saving receipt:", error);
      Alert.alert("Error", "Failed to save receipt");
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
          <Text className="text-xl font-bold text-black">Manual Entry</Text>
        </View>

        <View className="space-y-4 flex-1">
          {/* Title */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Title
            </Text>
            <TextInput
              className="w-full border border-gray-300 rounded-md p-2 text-black bg-white"
              value={formData.title + " receipt"}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, title: text }))
              }
              placeholder="Enter title"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Note (without fixed height) */}
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

          {/* Date */}
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

          {/* Total Cost */}
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
                    onPress={() => setIsAddCategoryModalVisible(true)}
                    className="px-4 py-2 rounded-full bg-gray-100"
                  >
                    <Text className="text-gray-500">+ Add new</Text>
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
                    onPress={() =>
                      handleMainCategoryPress(selectedMainCategory)
                    }
                    className="px-4 py-2 rounded-full bg-blue-500 w-auto"
                    style={{ alignSelf: "flex-start" }}
                  >
                    <Text className="text-white">{selectedMainCategory}</Text>
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
                        className="px-4 py-2 rounded-full bg-gray-100"
                      >
                        <Text className="text-gray-500">+ Add new</Text>
                      </TouchableOpacity>
                      {categories[selectedMainCategory]?.map((subCategory) => (
                        <TouchableOpacity
                          key={subCategory}
                          onPress={() => handleSubCategoryPress(subCategory)}
                          className="px-4 py-2 rounded-full bg-gray-100"
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
                        className="px-4 py-2 rounded-full bg-green-500"
                      >
                        <Text className="text-white">
                          {selectedSubCategory}
                        </Text>
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
                  // Format date as mm/dd/yyyy
                  const formattedDate = `${
                    selectedDate.getMonth() + 1
                  }/${selectedDate.getDate()}/${selectedDate.getFullYear()}`;
                  setUntilDate(formattedDate);
                }
              }}
            />
          )}

          {/* Repeating Section */}
          <View>
            <TouchableOpacity
              onPress={() => setIsRepeating(!isRepeating)}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderWidth: 1,
                  borderColor: "gray",
                  backgroundColor: isRepeating ? "blue" : "white",
                  marginRight: 8,
                }}
              />
              <Text className="text-sm text-gray-700">Repeating</Text>
            </TouchableOpacity>
            {isRepeating && (
              <View className="mt-2">
                <Text className="text-sm text-gray-700">Repeat every</Text>
                <View className="flex-row items-center space-x-2">
                  <TextInput
                    value={frequencyNumber}
                    onChangeText={setFrequencyNumber}
                    keyboardType="number-pad"
                    className="border border-gray-300 rounded-md p-2 text-black bg-white w-16"
                    placeholder="1"
                  />
                  <TouchableOpacity
                    onPress={() => setIsUnitModalVisible(true)}
                    className="px-4 py-2 rounded-md bg-gray-200"
                  >
                    <Text className="text-gray-700 capitalize">
                      {frequencyUnit}
                    </Text>
                  </TouchableOpacity>
                  <Text className="text-sm text-gray-700">until</Text>
                  <TouchableOpacity
                    onPress={() => setIsDatePickerVisible(true)}
                    className="px-4 py-2 rounded-md bg-gray-200"
                  >
                    <Text className="text-gray-700">{untilDate}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Fixed Save Button at the bottom */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-white">
        <TouchableOpacity
          onPress={handleSave}
          className="px-6 py-4 rounded-md bg-green-500"
        >
          <Text className="text-white text-center text-lg">Save</Text>
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
