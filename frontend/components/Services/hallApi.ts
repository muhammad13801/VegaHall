import api from "./sessionApi";

// Hall payments
export const payHallApi = () => api.post("/halls/charge");
export const confirmPaymentApi = (data: any) =>
  api.post("/halls/confirm-payment", data);

// Halls
export const getOwnerHallsApi = (page: number = 1, limit: number = 5) =>
  api.get(`/halls/owner-halls?page=${page}&limit=${limit}`);

export const getHallApi = (id: number) => api.get(`/halls/${id}`);

export const updateHallApi = (id: number, data: any) =>
  api.put(`/halls/${id}`, data);

export const deleteHallApi = (id: number) => api.delete(`/halls/${id}`);

export const getHallCommentsApi = (id: number) =>
  api.get(`/halls/${id}/comments`);

// Booking management
export const getOwnerBookingsApi = (page: number = 1, limit: number = 10) =>
  api.get(`/halls/bookings?page=${page}&limit=${limit}`);

// Owner actions
export const proposeRescheduleApi = (id: number, proposed_date: string) =>
  api.patch(`/halls/bookings/${id}/propose-reschedule`, { proposed_date });

export const rejectBookingApi = (id: number) =>
  api.patch(`/halls/bookings/${id}/reject`);

export const requestServiceApi = (name: string) =>
  api.post("/halls/request-service", { name });

export const requestMealApi = (name: string) =>
  api.post("/halls/request-meal", { name });

export const getServicesApi = () => api.get(`/halls/services`);

export const getMealTypesApi = () => api.get(`/halls/meal-types`);
