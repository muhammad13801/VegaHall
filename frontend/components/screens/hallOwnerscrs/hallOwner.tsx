import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import Profile from "./profile/profile";
import Notifications from "./notifications";
import ManageBookings from "./manageBookings";
import Home from "./home";

export const Tab = createBottomTabNavigator();

export default function HallOwnerTabs() {
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
        name="ManageBookings"
        component={ManageBookings}
        options={{
          title: "ادارة الحجوزات",
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
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
