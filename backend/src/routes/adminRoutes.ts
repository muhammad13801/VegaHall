import { Router } from "express";
import {
  getStats,
  getAllUsers,
  updateUserStatus,
  getPendingHalls,
  getAdminHalls,
  getAllHallsSimple,
  approveHall,
  addServiceToHall,
  addServiceToAllHalls,
  getGlobalServices,
  getServiceRequests,
  approveServiceRequest,
  rejectServiceRequest,
  addGlobalService,
  getGlobalMealTypes,
  getMealRequests,
  approveMealRequest,
  rejectMealRequest,
  addGlobalMealType,
} from "../controllers/adminControllers/adminController.js";
import { sessionAuthenticate } from "../middleware/sessionMiddleware.js";

const router = Router();

// Apply sessionMiddleware to all admin routes if needed
router.use(sessionAuthenticate as any);

router.get("/stats", getStats as any);
router.get("/users", getAllUsers as any);
router.patch("/users/:id/status", updateUserStatus as any);
router.get("/halls/pending", getPendingHalls as any);
router.get("/halls", getAdminHalls as any);
router.get("/halls/all-simple", getAllHallsSimple as any);
router.post("/halls/:id/approve", approveHall as any);
router.post("/halls/add-service", addServiceToHall as any);
router.post("/halls/add-service-all", addServiceToAllHalls as any);

// Service Requests
router.get("/services", getGlobalServices as any);
router.get("/services/requests", getServiceRequests as any);
router.post("/services/requests/:id/approve", approveServiceRequest as any);
router.post("/services/requests/:id/reject", rejectServiceRequest as any);
router.post("/services/add", addGlobalService as any);

// Meal Requests
router.get("/meals", getGlobalMealTypes as any);
router.get("/meals/requests", getMealRequests as any);
router.post("/meals/requests/:id/approve", approveMealRequest as any);
router.post("/meals/requests/:id/reject", rejectMealRequest as any);
router.post("/meals/add", addGlobalMealType as any);

export default router;
