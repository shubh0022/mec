import { Router } from "express";
import { StockController } from "../controllers/stock.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validateBody, validateQuery } from "../middlewares/validate.middleware.js";
import { CreateStockMovementSchema, PaginationQuerySchema, Role } from "@vanta/shared";

const router = Router();

router.use(authenticate);

router.get("/movements", validateQuery(PaginationQuerySchema), StockController.getStockMovements);

// Direct stock adjustment is restricted to WAREHOUSE and ADMIN. SALES cannot create manual stock movements.
router.post(
  "/movements",
  authorize(Role.ADMIN, Role.WAREHOUSE),
  validateBody(CreateStockMovementSchema),
  StockController.createStockMovement
);

export default router;
