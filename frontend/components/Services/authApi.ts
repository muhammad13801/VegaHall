import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigateAndReset } from "../reusable func/navigateTo";
import Toast from "react-native-toast-message";

// Global Interceptor for Session Expiry
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const message = error.response?.data || "";
      // If it's a session related error (not wrong password/email)
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

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.88.13:3000/auth";

// Sign Up
export const registerUser = async (data: any) => {
  return axios.post(`${BASE_URL}/register`, data);
};

export const verifyRegisterCode = async (email: string, code: string) => {
  return axios.post(`${BASE_URL}/verify`, { email, code });
};

// shared with forgot password
export const resendCode = async (email: string) => {
  return axios.post(`${BASE_URL}/resend-code`, { email });
};

// Forgot Password
export const sendResetCode = async (email: string) => {
  return axios.post(`${BASE_URL}/send-code`, { email });
};

export const verifyResetCode = async (email: string, code: string) => {
  return axios.post(`${BASE_URL}/verify`, { email, code });
};

export const updateNewPassword = async (email: string, password: string) => {
  return axios.post(`${BASE_URL}/update-new-password`, { email, password });
};

// login
export const login = async (email: string, password: string) => {
  return axios.post(`${BASE_URL}/login`, { email, password });
};

const USER_BASE_URL =
  process.env.EXPO_PUBLIC_USER_API_URL || "http://192.168.88.13:3000/user";

// change password
export const changePasswordApi = async (data: any, sessionId: string) => {
  return axios.post(`${USER_BASE_URL}/change-password`, data, {
    headers: { Authorization: sessionId },
  });
};

// logout
export const logoutApi = async (sessionId: string) => {
  return axios.post(
    `${USER_BASE_URL}/logout`,
    {},
    {
      headers: { Authorization: sessionId },
    },
  );
};

// get profile
export const getProfileApi = async (sessionId: string) => {
  return axios.get(`${USER_BASE_URL}/profile`, {
    headers: { Authorization: sessionId },
  });
};

// update name
export const updateNameApi = async (sessionId: string, data: any) => {
  return axios.post(`${USER_BASE_URL}/update-name`, data, {
    headers: { Authorization: sessionId },
  });
};

// update phone
export const updatePhoneApi = async (sessionId: string, data: any) => {
  return axios.post(`${USER_BASE_URL}/update-phone`, data, {
    headers: { Authorization: sessionId },
  });
};

// update email
export const checkEmailApi = async (sessionId: string, data: any) => {
  return axios.post(`${USER_BASE_URL}/check-email`, data, {
    headers: { Authorization: sessionId },
  });
};

export const updateEmailApi = async (sessionId: string, data: any) => {
  return axios.post(`${USER_BASE_URL}/update-email`, data, {
    headers: { Authorization: sessionId },
  });
};
