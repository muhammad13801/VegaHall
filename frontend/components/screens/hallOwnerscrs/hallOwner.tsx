import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import Profile from "./profile/profile";
import Notifications from "./notifications";
import ManageBookings from "./manageBookings";
import Home from "./home";

export const Tab = createBottomTabNavigator();

const TABS = [
  { name: "Home", component: Home, title: "الرئيسية", icon: "home-outline" },
  {
    name: "Notifications",
    component: Notifications,
    title: "الاشعارات",
    icon: "notifications-outline",
  },
  {
    name: "ManageBookings",
    component: ManageBookings,
    title: "ادارة الحجوزات",
    icon: "calendar-outline",
  },
  {
    name: "Profile",
    component: Profile,
    title: "حسابي",
    icon: "person-outline",
  },
];

export default function HallOwner() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#6C4AB6",
        tabBarInactiveTintColor: "#999",
        tabBarLabelStyle: { fontSize: 14 },
      }}
    >
      {TABS.map((tab) => (
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
