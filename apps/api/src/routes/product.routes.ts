import { Router } from "express";
import { ProductController } from "../controllers/product.controller.js";
import { authenticate, authorize, protectReadOnlyGuest } from "../middlewares/auth.middleware.js";
import { validateBody, validateQuery } from "../middlewares/validate.middleware.js";
import { CreateProductSchema, UpdateProductSchema, PaginationQuerySchema, Role } from "@vanta/shared";

const router = Router();

router.use(authenticate);
router.use(protectReadOnlyGuest);

router.get("/meta/categories", ProductController.getCategories);
router.get("/meta/warehouses", ProductController.getWarehouses);

router.get("/", validateQuery(PaginationQuerySchema), ProductController.getProducts);
router.get("/:id", ProductController.getProductById);

// Product creation/modification restricted to WAREHOUSE & ADMIN
router.post(
  "/",
  authorize(Role.ADMIN, Role.WAREHOUSE),
  validateBody(CreateProductSchema),
  ProductController.createProduct
);

router.patch(
  "/:id",
  authorize(Role.ADMIN, Role.WAREHOUSE),
  validateBody(UpdateProductSchema),
  ProductController.updateProduct
);

export default router;
