import { Router } from "express";
import { AuditController } from "../controllers/audit.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { Role } from "@vanta/shared";

const router = Router();

router.use(authenticate);
router.use(authorize(Role.ADMIN));

router.get("/", AuditController.getLogs);

export default router;
