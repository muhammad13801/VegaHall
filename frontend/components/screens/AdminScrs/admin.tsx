import React from "react";
import { View, ActivityIndicator } from "react-native";
import { styles } from "../../styles";
import { getAdminStats } from "../../Services/adminApi";
import { Ionicons } from "@expo/vector-icons";
import { Tab } from "../hallOwnerscrs/hallOwner";
import Profile from "../hallOwnerscrs/profile/profile";
import Home from "./home";
import Notifications from "./notifications";
import ManageServices from "./manageServices";
import { useEffect, useState } from "react";

// تعريف التابات هنا بره الكمبوننت عشان ما تتعاد كل رندر
const ADMIN_TABS = [
  { name: "Home", component: Home, title: "الرئيسية", icon: "home-outline" },
  {
    name: "Notifications",
    component: Notifications,
    title: "الاشعارات",
    icon: "notifications-outline",
  },
  {
    name: "ManageServices",
    component: ManageServices,
    title: "ادارة الخدمات",
    icon: "list-outline",
  },
  {
    name: "Profile",
    component: Profile,
    title: "حسابي",
    icon: "person-outline",
  },
];

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
      {ADMIN_TABS.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            title: tab.title,
            tabBarIcon: ({ size, color }) => (
              <Ionicons name={tab.icon as any} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}
