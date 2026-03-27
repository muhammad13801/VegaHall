import api from "./sessionApi";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const registerUser = (data: any) =>
  api.post(`${BASE_URL}/register`, data);

export const verifyRegisterCode = (email: string, code: string) =>
  api.post(`${BASE_URL}/verify`, { email, code });

export const resendCode = (email: string) =>
  api.post(`${BASE_URL}/resend-code`, { email });

export const sendResetCode = (email: string) =>
  api.post(`${BASE_URL}/send-code`, { email });

export const verifyResetCode = (email: string, code: string) =>
  api.post(`${BASE_URL}/verify`, { email, code });

export const updateNewPassword = (email: string, password: string) =>
  api.post(`${BASE_URL}/update-new-password`, { email, password });

export const login = (email: string, password: string) =>
  api.post(`${BASE_URL}/login`, { email, password });
