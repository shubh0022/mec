import { Router } from "express";
import { ReportController } from "../controllers/report.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { Role } from "@vanta/shared";

const router = Router();

router.use(authenticate);

// Stock Report: Accessible to ADMIN, WAREHOUSE, ACCOUNTS, SALES, GUEST
router.get(
  "/stock",
  authorize(Role.ADMIN, Role.WAREHOUSE, Role.ACCOUNTS, Role.SALES, Role.GUEST),
  ReportController.getStockReport
);

// Sales Report: Accessible to ADMIN, SALES, ACCOUNTS, GUEST
router.get(
  "/sales",
  authorize(Role.ADMIN, Role.SALES, Role.ACCOUNTS, Role.GUEST),
  ReportController.getSalesReport
);

export default router;
