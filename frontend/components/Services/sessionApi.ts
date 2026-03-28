import axios, { InternalAxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigateAndReset } from "../reusable func/navigateTo";
import Toast from "react-native-toast-message";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_LOCAL_IP!,
});

// REQUEST INTERCEPTOR: attach sessionId
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const sessionId = await AsyncStorage.getItem("sessionId");

    if (sessionId) {
      if (!config.headers) {
        config.headers = {} as InternalAxiosRequestConfig["headers"];
      }
      config.headers["Authorization"] = sessionId;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// RESPONSE INTERCEPTOR: handle session expiry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const message = error.response?.data || "";
      if (
        message.includes("الجلسة") ||
        message.includes("انتهت") ||
        message.includes("غير صالحة")
      ) {
        await AsyncStorage.removeItem("sessionId");
        Toast.show({
          type: "error",
          text1: "انتهت صلاحية الجلسة",
          text2: "الرجاء تسجيل الدخول مرة أخرى",
        });
        NavigateAndReset("Login");
      }
    }
    return Promise.reject(error);
  },
);

export default api;
