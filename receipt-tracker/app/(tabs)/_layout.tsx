import React from "react";
import { Text } from "react-native";
import { Tabs } from "expo-router";
import "~/global.css";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#6b7280",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          height: 70, // Increase the overall height
          paddingBottom: 10, // Add extra padding at the bottom
          paddingTop: 10, // Add extra padding at the top
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <FontAwesome5 name="home" size={24} color="black" />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarIcon: ({ focused }) => (
            <FontAwesome6 name="money-bills" size={24} color="black" />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ focused }) => (
            <Entypo name="dots-three-horizontal" size={24} color="black" />
          ),
        }}
      />
    </Tabs>
  );
}
