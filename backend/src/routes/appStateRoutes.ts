import { Router } from "express";
import { getAppState } from "../utils/updateAppState.ts";

const router = Router();

router.get("/last-updated", getAppState);

export default router;
