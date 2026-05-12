import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { RefreshProvider, useRefresh } from "../../reusable func/refreshContext";
import Customer from "./customer";
import Favorites from "./favorites";
import Profile from "../hallOwnerscrs/profile/profile";
import MyBookings from "./myBookings";
import Notifications from "../hallOwnerscrs/notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";
import { useRealtimeUpdates } from "../../reusable func/useRealtimeUpdate";
import { supabase } from "../../Services/supabaseClient";


const Tab = createBottomTabNavigator();

export default function CustomerNavigator() {
 const [userId, setUserId] = useState<string>("");
 const {triggerRefresh} = useRefresh();
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
    userRole: "customer",
    userId,
    onNotificationsChange: (count) =>{ setNotificationBadge(count);
      triggerRefresh();
    },
    onBookingsChange: setBookingBadge,
  });

  
  return (
    <RefreshProvider>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#6C4AB6",
          tabBarInactiveTintColor: "#999",
          tabBarLabelStyle: { fontSize: 14 },
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={Customer}
          options={{
            title: "الرئيسية",
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="NotificationTab"
          component={Notifications}
          options={{
            title: "الاشعارات",
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="notifications-outline" size={size} color={color} />
            ),
            tabBarBadge: notificationBadge || undefined,
            tabBarBadgeStyle: {
              backgroundColor: "#DC2626",
              color: "#FFFFFF",
              fontSize: 12,
              fontWeight: "bold",
            },
          }}
          listeners={{
            focus: async () => {
              if (!userId) return;
              await supabase
                .from("notifications")
                .update({ is_read: true })
                .eq("user_id", Number(userId))
                .eq("is_read", false);
              setNotificationBadge(0);
            },
          }}
        />
        <Tab.Screen
          name="FavoritesTab"
          component={Favorites}
          options={{
            title: "المفضلة",
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="heart-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="BookingsTab"
          component={MyBookings}
          options={{
            title: "حجوزاتي",
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="calendar-outline" size={size} color={color} />
            ),
            tabBarBadge: bookingBadge || undefined,
            tabBarBadgeStyle: {
              backgroundColor: "#DC2626",
              color: "#FFFFFF",
              fontSize: 12,
              fontWeight: "bold",
            },
          }}
          listeners={{
            focus: async () => {
              if (!userId) return;
              await supabase
                .from("bookings")
                .update({ is_read: true })
                .eq("customer_id", Number(userId))
                .eq("is_read", false);
              setBookingBadge(0);
            },
          }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={Profile}
          options={{
            title: "حسابي",
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
      </RefreshProvider>
  );
}
