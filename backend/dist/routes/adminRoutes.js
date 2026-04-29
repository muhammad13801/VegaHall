import { Router } from "express";
import { getStats, getAllUsers, updateUserStatus, getPendingHalls, getAdminHalls, getAllHallsSimple, approveHall, addServiceToHall, addServiceToAllHalls, getGlobalServices, getServiceRequests, approveServiceRequest, rejectServiceRequest, addGlobalService, getGlobalMealTypes, getMealRequests, approveMealRequest, rejectMealRequest, addGlobalMealType, } from "../controllers/adminControllers/adminController.js";
import { sessionAuthenticate } from "../middleware/sessionMiddleware.js";
const router = Router();
// Apply sessionMiddleware to all admin routes if needed
router.use(sessionAuthenticate);
router.get("/stats", getStats);
router.get("/users", getAllUsers);
router.patch("/users/:id/status", updateUserStatus);
router.get("/halls/pending", getPendingHalls);
router.get("/halls", getAdminHalls);
router.get("/halls/all-simple", getAllHallsSimple);
router.post("/halls/:id/approve", approveHall);
router.post("/halls/add-service", addServiceToHall);
router.post("/halls/add-service-all", addServiceToAllHalls);
// Service Requests
router.get("/services", getGlobalServices);
router.get("/services/requests", getServiceRequests);
router.post("/services/requests/:id/approve", approveServiceRequest);
router.post("/services/requests/:id/reject", rejectServiceRequest);
router.post("/services/add", addGlobalService);
// Meal Requests
router.get("/meals", getGlobalMealTypes);
router.get("/meals/requests", getMealRequests);
router.post("/meals/requests/:id/approve", approveMealRequest);
router.post("/meals/requests/:id/reject", rejectMealRequest);
router.post("/meals/add", addGlobalMealType);
export default router;
