import { Router } from "express";
import { ChallanController } from "../controllers/challan.controller.js";
import { authenticate, authorize, protectReadOnlyGuest } from "../middlewares/auth.middleware.js";
import { validateBody, validateQuery } from "../middlewares/validate.middleware.js";
import {
  CreateSalesChallanSchema,
  UpdateSalesChallanSchema,
  PaginationQuerySchema,
  Role
} from "@vanta/shared";

const router = Router();

router.use(authenticate);
router.use(protectReadOnlyGuest);

router.get("/", validateQuery(PaginationQuerySchema), ChallanController.getChallans);
router.get("/:id", ChallanController.getChallanById);

// Create challan draft (Admin, Sales)
router.post(
  "/",
  authorize(Role.ADMIN, Role.SALES),
  validateBody(CreateSalesChallanSchema),
  ChallanController.createChallan
);

// Update challan draft (Admin, Sales)
router.patch(
  "/:id",
  authorize(Role.ADMIN, Role.SALES),
  validateBody(UpdateSalesChallanSchema),
  ChallanController.updateChallan
);

// Confirm challan (Admin, Sales) - Triggers stock deduction transaction
router.post("/:id/confirm", authorize(Role.ADMIN, Role.SALES), ChallanController.confirmChallan);

// Cancel challan (Admin, Sales)
router.post("/:id/cancel", authorize(Role.ADMIN, Role.SALES), ChallanController.cancelChallan);

export default router;
