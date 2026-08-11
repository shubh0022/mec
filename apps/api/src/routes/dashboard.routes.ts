import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/summary", DashboardController.getSummary);

export default router;
