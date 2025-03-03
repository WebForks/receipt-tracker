import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "~/utils/supabase";
import "~/global.css";

export default function Settings() {
  const router = useRouter();

  // State for current user email (fetched from Supabase)
  const [currentEmail, setCurrentEmail] = useState("");

  // Upcoming Transactions Notifications toggle state
  const [upcomingToggle, setUpcomingToggle] = useState(false);

  // Dropdown toggles
  const [emailDropdownVisible, setEmailDropdownVisible] = useState(false);
  const [passwordDropdownVisible, setPasswordDropdownVisible] = useState(false);

  // Change email form state
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");

  // Change password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Fetch the current user's email on mount
  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setCurrentEmail(data.user.email || "");
      }
    }
    fetchUser();
  }, []);

  // Function to update or insert the upcoming notifications setting
  const updateUpcomingNotifications = async (notifications: boolean) => {
    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.log("Error fetching user:", userError.message);
      return;
    }
    if (!userData?.user) {
      console.log("No user logged in");
      return;
    }
    const uid = userData.user.id;

    // Construct the new settings object
    const newSettings = { upcomingNotifications: notifications };

    // Check if a profile row exists
    const { data: profileData, error: selectError } = await supabase
      .from("profiles")
      .select("settings")
      .eq("user_id", uid)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      // If an error other than "no rows" is returned, log it.
      console.log("Error checking profile:", selectError.message);
      return;
    }

    let actionError = null;
    if (profileData) {
      // Update the existing row
      const { error } = await supabase
        .from("profiles")
        .update({ settings: newSettings })
        .eq("user_id", uid);
      actionError = error;
    } else {
      // Insert a new row if no profile exists
      const { error } = await supabase
        .from("profiles")
        .insert([{ user_id: uid, settings: newSettings }]);
      actionError = error;
    }

    if (actionError) {
      console.log("Error updating/inserting settings:", actionError.message);
    } else {
      console.log("Settings updated:", newSettings);
    }
  };

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      router.replace("/signin");
    }
  }

  async function handleChangeEmail() {
    if (!newEmail || !emailPassword) {
      Alert.alert(
        "Error",
        "Please provide a new email and your current password."
      );
      return;
    }
    // Call Supabase API to update email
    const { error } = await supabase.auth.updateUser({
      email: newEmail,
      password: emailPassword,
    });
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Email updated successfully.");
      setCurrentEmail(newEmail);
      setNewEmail("");
      setEmailPassword("");
      setEmailDropdownVisible(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert("Error", "Please fill out all password fields.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }
    // Call Supabase API to update password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setPasswordDropdownVisible(false);
    }
  }

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-xl font-bold mb-4 text-black">Settings</Text>

      {/* Export Button */}
      <TouchableOpacity className="w-full bg-green-500 py-3 mb-4 rounded-lg">
        <Text className="text-center text-white font-semibold">Export</Text>
      </TouchableOpacity>

      {/* Import Button */}
      <TouchableOpacity className="w-full bg-green-500 py-3 mb-4 rounded-lg">
        <Text className="text-center text-white font-semibold">Import</Text>
      </TouchableOpacity>

      {/* Upcoming Transactions Notifications Toggle */}
      <View className="flex-row items-center justify-between w-full mb-4">
        <Text className="text-black font-semibold">
          Upcoming Transactions Notifications
        </Text>
        <Switch
          value={upcomingToggle}
          onValueChange={async (newValue) => {
            setUpcomingToggle(newValue);
            await updateUpcomingNotifications(newValue);
          }}
          thumbColor={upcomingToggle ? "#3b82f6" : "#f4f3f4"}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
        />
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        onPress={handleLogout}
        className="w-full bg-red-500 py-3 mb-4 rounded-lg"
      >
        <Text className="text-center text-white font-semibold">Log Out</Text>
      </TouchableOpacity>

      {/* Change Email Dropdown Toggle */}
      <TouchableOpacity
        onPress={() => setEmailDropdownVisible(!emailDropdownVisible)}
        className="w-full bg-blue-500 py-3 mb-2 rounded-lg"
      >
        <Text className="text-center text-white font-semibold">
          Change Email
        </Text>
      </TouchableOpacity>
      {emailDropdownVisible && (
        <View className="w-full bg-gray-100 p-4 mb-4 rounded-lg">
          <Text className="text-black mb-2">Current Email: {currentEmail}</Text>
          <TextInput
            placeholder="New Email"
            value={newEmail}
            onChangeText={setNewEmail}
            className="w-full border border-gray-300 p-2 mb-2 rounded"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            placeholder="Password"
            value={emailPassword}
            onChangeText={setEmailPassword}
            className="w-full border border-gray-300 p-2 mb-2 rounded"
            secureTextEntry
          />
          <TouchableOpacity
            onPress={handleChangeEmail}
            className="w-full bg-blue-500 py-2 rounded-lg"
          >
            <Text className="text-center text-white font-semibold">
              Change Email
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Change Password Dropdown Toggle */}
      <TouchableOpacity
        onPress={() => setPasswordDropdownVisible(!passwordDropdownVisible)}
        className="w-full bg-blue-500 py-3 mb-2 rounded-lg"
      >
        <Text className="text-center text-white font-semibold">
          Change Password
        </Text>
      </TouchableOpacity>
      {passwordDropdownVisible && (
        <View className="w-full bg-gray-100 p-4 rounded-lg">
          <TextInput
            placeholder="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            className="w-full border border-gray-300 p-2 mb-2 rounded"
            secureTextEntry
          />
          <TextInput
            placeholder="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            className="w-full border border-gray-300 p-2 mb-2 rounded"
            secureTextEntry
          />
          <TextInput
            placeholder="Confirm New Password"
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
            className="w-full border border-gray-300 p-2 mb-2 rounded"
            secureTextEntry
          />
          <TouchableOpacity
            onPress={handleChangePassword}
            className="w-full bg-blue-500 py-2 rounded-lg"
          >
            <Text className="text-center text-white font-semibold">
              Change Password
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
