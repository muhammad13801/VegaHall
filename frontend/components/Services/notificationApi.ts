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

export async function registerPushToken() {
  if (!Device.isDevice) return null;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return null;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) return null;

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    await savePushTokenApi(token).catch((err) => {
      console.error("Failed to save push token:", err.response?.data || err.message);
    });
    return token;
  } catch (error) {
    console.error("Push registration fatal error:", error);
    return null;
  }
}
