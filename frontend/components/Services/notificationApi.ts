import api from "./sessionApi";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

// GET notifications
export const getNotificationsApi = (page = 1, limit = 10) =>
  api.get(`/notifications?page=${page}&limit=${limit}`);

// SAVE token to backend
export const savePushTokenApi = (token: string) =>
  api.patch("/notifications/token", { token });

/*export async function registerPushToken() {
  try {
    if (!Device.isDevice)
      return console.log("Push notifications require a real device");

    // Set up channel FIRST on Android
    if (Platform.OS === "android")
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
      });

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") return console.log("Permission not granted");

    const projectId =
      Constants.easConfig?.projectId ||
      Constants.expoConfig?.extra?.eas?.projectId;

    if (!projectId) return console.log("Missing Expo projectId");

    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    if (!token) return console.log("Failed to get Expo push token");

    console.log("Expo Push Token:", token);

    await savePushTokenApi(token).catch((err) =>
      console.log("Failed to save token to backend:", err),
    );

    console.log("Push token saved successfully");
  } catch (error) {
    console.log("registerPushToken error:", error);
  }
}*/
