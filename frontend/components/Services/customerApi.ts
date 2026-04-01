import api from "./sessionApi";

export const respondRescheduleApi = (id: number, accept: boolean) =>
  api.patch(`/halls/bookings/${id}/reschedule/respond`, { accept });

export const cancelBookingApi = (id: number) =>
  api.patch(`/halls/bookings/${id}/cancel`);
