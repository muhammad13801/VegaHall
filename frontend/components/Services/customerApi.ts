import api from "./sessionApi";

const CUSTOMER_BASE_URL = `${process.env.EXPO_PUBLIC_LOCAL_IP}/customer`;

// Search
export const searchApi = async (data: any) =>
  api.post(`${CUSTOMER_BASE_URL}/search`, data);

// Halls
export const getHallsApi = async () =>
  api.get(`${CUSTOMER_BASE_URL}/halls`);

export const getHallByIdApi = async (id: number) =>
  api.get(`${CUSTOMER_BASE_URL}/halls/${id}`);

// Favorites
export const getFavoritesApi = async (page: number, limit: number) =>
  api.get(`${CUSTOMER_BASE_URL}/favorites?page=${page}&limit=${limit}`);

export const toggleFavoriteApi = async (hallId: number) =>
  api.post(`${CUSTOMER_BASE_URL}/favorites/toggle`, { hallId });

// Bookings
export const getBookingsApi = async (page: number, limit: number) =>
  api.get(`${CUSTOMER_BASE_URL}/bookings?page=${page}&limit=${limit}`);

export const createBookingApi = async (data: any) =>
  api.post(`${CUSTOMER_BASE_URL}/bookings`, data);

export const cancelBookingApi = async (id: number) =>
  api.put(`${CUSTOMER_BASE_URL}/bookings/${id}/cancel`, {});

export const respondRescheduleApi = async (id: number, accept: boolean) =>
  api.patch(`${CUSTOMER_BASE_URL}/bookings/${id}/reschedule/respond`, { accept });

// Ratings
export const getHallRatingsApi = async (hallId: number) =>
  api.get(`${CUSTOMER_BASE_URL}/halls/${hallId}/ratings`);

export const createRatingApi = async (data: any) =>
  api.post(`${CUSTOMER_BASE_URL}/ratings`, data);

// Payments
export const chargeBookingApi = async (data: any) =>
  api.post(`${CUSTOMER_BASE_URL}/charge-booking`, data);

export const confirmBookingPaymentApi = async (data: any) =>
  api.post(`${CUSTOMER_BASE_URL}/confirm-booking-payment`, data);
