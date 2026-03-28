import api from "./sessionApi";

export const payHallApi = () => api.post("/halls/charge");

export const confirmPaymentApi = (data: any) =>
  api.post("/halls/confirm-payment", data);

export const getOwnerHallsApi = (page: number = 1, limit: number = 5) =>
  api.get(`/halls/owner-halls?page=${page}&limit=${limit}`);

export const getHallApi = (id: number) => api.get(`/halls/${id}`);

export const updateHallApi = (id: number, data: any) =>
  api.put(`/halls/${id}`, data);

export const deleteHallApi = (id: number) => api.delete(`/halls/${id}`);

export const getHallCommentsApi = (id: number) =>
  api.get(`/halls/${id}/comments`);
