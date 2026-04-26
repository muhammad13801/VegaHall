import api from "./sessionApi";

export const getAdminStats = async () => {
  return api.get("/admin/stats");
};

export const getAllUsers = async (search?: string, rating?: string) => {
  return api.get("/admin/users", { params: { search, rating } });
};

export const updateUserStatus = async (id: number, status: string) => {
  return api.patch(`/admin/users/${id}/status`, { status });
};

export const getAdminHalls = async (search?: string, rating?: string) => {
  return api.get("/admin/halls", { params: { search, rating } });
};

export const getPendingHalls = async () => {
  return api.get("/admin/halls/pending");
};

export const getAllHallsSimple = async () => {
  return api.get("/admin/halls/all-simple");
};

export const approveHall = async (id: number) => {
  return api.post(`/admin/halls/${id}/approve`);
};

export const addHallService = async (hallId: number, name: string, price: number) => {
  return api.post("/admin/halls/add-service", { hallId, name, price });
};

export const addServiceToAllHalls = async (name: string, price: number) => {
  return api.post("/admin/halls/add-service-all", { name, price });
};

// الخدمات العامة
export const getGlobalServices = async () => {
  return api.get("/admin/services");
};

export const addGlobalService = async (name: string) => {
  return api.post("/admin/services/add", { name });
};

// أنواع الوجبات العامة
export const getGlobalMealTypes = async () => {
  return api.get("/admin/meals");
};

export const addGlobalMealType = async (name: string) => {
  return api.post("/admin/meals/add", { name });
};

// طلبات الخدمات
export const getServiceRequests = async () => {
  return api.get("/admin/services/requests");
};

export const approveServiceRequest = async (id: number) => {
  return api.post(`/admin/services/requests/${id}/approve`);
};

export const rejectServiceRequest = async (id: number) => {
  return api.post(`/admin/services/requests/${id}/reject`);
};

// طلبات الوجبات
export const getMealRequests = async () => {
  return api.get("/admin/meals/requests");
};

export const approveMealRequest = async (id: number) => {
  return api.post(`/admin/meals/requests/${id}/approve`);
};

export const rejectMealRequest = async (id: number) => {
  return api.post(`/admin/meals/requests/${id}/reject`);
};
