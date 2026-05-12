import React, { useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Profile from "./profile/profile";
import Notifications from "./notifications";
import ManageBookings from "./manageBookings";
import Home from "./home";
import { useRealtimeUpdates } from "../../reusable func/useRealtimeUpdate";
import { supabase } from "../../Services/supabaseClient";

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
    title: "الحجوزات",
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
  const [userId, setUserId] = useState<string>("");
  const [notificationBadge, setNotificationBadge] = useState(0);
  const [bookingBadge, setBookingBadge] = useState(0);

  // Get userId from AsyncStorage on mount
  useEffect(() => {
    const getUserId = async () => {
      try {
        const id = await AsyncStorage.getItem("userId");
        if (id) {
          setUserId(id);
        }
      } catch (error) {
        console.error("Error getting userId from AsyncStorage:", error);
      }
    };

    getUserId();
  }, []);

  // Setup realtime listeners once userId is available
  useRealtimeUpdates({
    userId,
    onNotificationsChange: setNotificationBadge,
    onBookingsChange: setBookingBadge,
  });
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#6C4AB6",
        tabBarInactiveTintColor: "#999",
        tabBarLabelStyle: { fontSize: 14, lineHeight: 20, paddingBottom: 2 },
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

            tabBarBadge:
              tab.name === "Notifications"
                ? notificationBadge || undefined
                : tab.name === "ManageBookings"
                  ? bookingBadge || undefined
                  : undefined,

            tabBarBadgeStyle: {
              backgroundColor: "#DC2626",
              color: "#FFFFFF",
              fontSize: 12,
              fontWeight: "bold",
            },
          }}
          listeners={
            tab.name === "ManageBookings"
              ? {
                  focus: async () => {
                    const userId = await AsyncStorage.getItem("userId");
                    if (!userId) return;

                    const { data: halls } = await supabase
                      .from("halls")
                      .select("id")
                      .eq("owner_id", Number(userId));

                    const hallIds = halls?.map((h) => h.id) || [];

                    await supabase
                      .from("bookings")
                      .update({ is_read: true })
                      .in("hall_id", hallIds)
                      .eq("is_read", false);

                    // optional: instantly clear badge
                    setBookingBadge(0);
                  },
                }
              : tab.name === "Notifications"
                ? {
                    focus: async () => {
                      const userId = await AsyncStorage.getItem("userId");
                      if (!userId) return;

                      await supabase
                        .from("notifications")
                        .update({ is_read: true })
                        .eq("user_id", Number(userId))
                        .eq("is_read", false);

                      // optional: instantly clear badge
                      setNotificationBadge(0);
                    },
                  }
                : undefined
          }
        />
      ))}
    </Tab.Navigator>
  );
}
