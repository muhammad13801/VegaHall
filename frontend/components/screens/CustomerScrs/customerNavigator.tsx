import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { RefreshProvider } from "../../reusable func/refreshContext";
import Customer from "./customer";
import Favorites from "./favorites";
import Profile from "../hallOwnerscrs/profile/profile";
import MyBookings from "./myBookings";
import Notifications from "../hallOwnerscrs/notifications";


const Tab = createBottomTabNavigator();

export default function CustomerNavigator() {
  
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
         <Tab.Screen
          name="NotificationTab"
          component={Notifications}
          options={{
            title: "الاشعارات",
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="notifications-outline" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
      </RefreshProvider>
  );
}
