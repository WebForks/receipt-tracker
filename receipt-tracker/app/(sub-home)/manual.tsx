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

export default function Manual() {
  const { aiResponse } = useLocalSearchParams();
  console.log("aiResponse", aiResponse);
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

  // Get screen dimensions
  const screenHeight = Dimensions.get("window").height;
  const noteFieldHeight = screenHeight * 0.3; // 30% of screen height

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
      // Get current user
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData?.user) throw new Error("No user logged in");

      // Get current categories
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("categories")
        .eq("user_id", userData.user.id)
        .single();

      if (profileError) throw profileError;

      // Check if category already exists
      if (
        profileData?.categories &&
        newCategoryName in profileData.categories
      ) {
        Alert.alert("Error", "Category already exists");
        return;
      }

      // Create new categories object
      const updatedCategories = {
        ...profileData?.categories,
        [newCategoryName]: [], // Initialize with empty subcategories array
      };

      // Update profiles table
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ categories: updatedCategories })
        .eq("user_id", userData.user.id);

      if (updateError) throw updateError;

      // Update local state
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
      // Get current user
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData?.user) throw new Error("No user logged in");

      // Get current categories
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("categories")
        .eq("user_id", userData.user.id)
        .single();

      if (profileError) throw profileError;

      // Check if subcategory already exists
      if (
        profileData?.categories[selectedMainCategory]?.includes(
          newSubCategoryName
        )
      ) {
        Alert.alert("Error", "Subcategory already exists");
        return;
      }

      // Create new categories object with updated subcategories
      const updatedCategories = {
        ...profileData?.categories,
        [selectedMainCategory]: [
          ...(profileData?.categories[selectedMainCategory] || []),
          newSubCategoryName,
        ],
      };

      // Update profiles table
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ categories: updatedCategories })
        .eq("user_id", userData.user.id);

      if (updateError) throw updateError;

      // Update local state
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
      // Get current user
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData?.user) throw new Error("No user logged in");

      // Get current accounts
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("accounts-and-cards")
        .eq("user_id", userData.user.id)
        .single();

      if (profileError) throw profileError;

      // Check if account already exists
      if (
        profileData?.["accounts-and-cards"] &&
        newAccountName in profileData["accounts-and-cards"]
      ) {
        Alert.alert("Error", "Account already exists");
        return;
      }

      // Create new accounts object (keeping same structure even if cards are not used)
      const updatedAccounts = {
        ...profileData?.["accounts-and-cards"],
        [newAccountName]: [],
      };

      // Update profiles table
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ "accounts-and-cards": updatedAccounts })
        .eq("user_id", userData.user.id);

      if (updateError) throw updateError;

      // Update local state
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
        // First parse the outer JSON to get the response string
        const outerParsed = JSON.parse(aiResponse as string);

        // Extract the inner JSON from the markdown code block
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
      // Unselect if clicking the same category
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
      // Toggle off if already selected
      setSelectedAccount(null);
    } else {
      setSelectedAccount(account);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <View className="justify-center items-center mb-6">
        <Text className="text-xl font-bold text-black">Manual Entry</Text>
      </View>

      <View className="space-y-4">
        {/* Form Fields */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Title</Text>
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

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Note</Text>
          <View
            style={{ height: noteFieldHeight }}
            className="w-full border border-gray-300 rounded-md bg-white"
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
                style={{ minHeight: "100%" }}
              />
            </ScrollView>
          </View>
        </View>

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
                  onPress={() => handleMainCategoryPress(selectedMainCategory)}
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
                      <Text className="text-white">{selectedSubCategory}</Text>
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
      </View>

      {/* Modals */}
      {/* Add Category Modal */}
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

      {/* Add Subcategory Modal */}
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

      {/* Add Account Modal */}
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
    </ScrollView>
  );
}
