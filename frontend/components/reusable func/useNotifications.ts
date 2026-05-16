import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerPushToken } from "../Services/notificationApi";
import { Platform } from "react-native";

export const useNotifications = () => {
  useEffect(() => {
    // 1. Android Channel Setup
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#6C4AB6",
      });
    }

    // 2. Token registration
    const initPush = async () => {
      const sessionId = await AsyncStorage.getItem("sessionId");
      if (sessionId) await registerPushToken();
    };
    initPush();

    // 3. Listeners
    const sub = Notifications.addNotificationReceivedListener(() => {});

    const resSub = Notifications.addNotificationResponseReceivedListener(() => {});

    return () => {
      sub.remove();
      resSub.remove();
    };
  }, []);
};
