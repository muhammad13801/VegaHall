import api from "./sessionApi";

export const getNotificationsApi = (page: number = 1, limit: number = 10) =>
  api.get(`/notifications?page=${page}&limit=${limit}`);
