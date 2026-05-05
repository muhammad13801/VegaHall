import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { styles } from "../../styles";
import { getAdminStats } from "../../Services/adminApi";
import { Ionicons } from "@expo/vector-icons";
import { Tab } from "../hallOwnerscrs/hallOwner";
import Profile from "../hallOwnerscrs/profile/profile";
import Home from "./home";
import Notifications from "../hallOwnerscrs/notifications";
import ManageServices from "./manageServices";

export default function Admin() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const { data } = await getAdminStats();
      setStats(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6C4AB6" />
      </View>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#6C4AB6",
        tabBarInactiveTintColor: "#999",
        tabBarLabelStyle: { fontSize: 14 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          title: "الرئيسية",
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Notifications"
        component={Notifications}
        options={{
          title: "الاشعارات",
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="ManageServices"
        component={ManageServices}
        options={{
          title: "ادارة الخدمات",
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          title: "حسابي",
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
