import api from "./sessionApi";
import { HallData } from "../Validations/validateHall";

export const addHallApi = (data: HallData) => api.post("/halls/add", data);

export const payHallApi = (data: any) => api.post("/halls/charge", data);

export const confirmPaymentApi = (data: { hallId: number; paymentIntentId: string }) =>
  api.post("/halls/confirm-payment", data);

export const getOwnerHallsApi = (page: number = 1, limit: number = 5) =>
  api.get(`/halls/owner-halls?page=${page}&limit=${limit}`);
