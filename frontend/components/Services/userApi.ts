import api from "./sessionApi";

const USER_BASE_URL = process.env.EXPO_PUBLIC_USER_API_URL;

export const changePasswordApi = (data: any) =>
  api.post(`${USER_BASE_URL}/change-password`, data);

export const logoutApi = () => api.post(`${USER_BASE_URL}/logout`);

export const getProfileApi = () => api.get(`${USER_BASE_URL}/profile`);

export const updateNameApi = (data: any) =>
  api.post(`${USER_BASE_URL}/update-name`, data);

export const updatePhoneApi = (data: any) =>
  api.post(`${USER_BASE_URL}/update-phone`, data);

export const checkEmailApi = (data: any) =>
  api.post(`${USER_BASE_URL}/check-email`, data);

export const updateEmailApi = (data: any) =>
  api.post(`${USER_BASE_URL}/update-email`, data);
