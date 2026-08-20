import { Router } from "express";
import { CustomerController } from "../controllers/customer.controller.js";
import { authenticate, authorize, protectReadOnlyGuest } from "../middlewares/auth.middleware.js";
import { validateBody, validateQuery } from "../middlewares/validate.middleware.js";
import {
  CreateCustomerSchema,
  UpdateCustomerSchema,
  CreateFollowUpSchema,
  PaginationQuerySchema,
  Role
} from "@vanta/shared";

const router = Router();

router.use(authenticate);
router.use(protectReadOnlyGuest);

// List and view customers: ADMIN, SALES, ACCOUNTS, WAREHOUSE, GUEST
router.get(
  "/",
  authorize(Role.ADMIN, Role.SALES, Role.ACCOUNTS, Role.WAREHOUSE, Role.GUEST),
  validateQuery(PaginationQuerySchema),
  CustomerController.getCustomers
);

router.get(
  "/:id",
  authorize(Role.ADMIN, Role.SALES, Role.ACCOUNTS, Role.WAREHOUSE, Role.GUEST),
  CustomerController.getCustomerById
);

// Create customer (Admin, Sales)
router.post(
  "/",
  authorize(Role.ADMIN, Role.SALES),
  validateBody(CreateCustomerSchema),
  CustomerController.createCustomer
);

// Update customer (Admin, Sales)
router.patch(
  "/:id",
  authorize(Role.ADMIN, Role.SALES),
  validateBody(UpdateCustomerSchema),
  CustomerController.updateCustomer
);

// Delete/Deactivate customer (Admin only)
router.delete("/:id", authorize(Role.ADMIN), CustomerController.deleteCustomer);

// Follow-ups
router.get("/:id/follow-ups", CustomerController.getFollowUps);
router.post(
  "/:id/follow-ups",
  authorize(Role.ADMIN, Role.SALES, Role.ACCOUNTS),
  validateBody(CreateFollowUpSchema),
  CustomerController.createFollowUp
);

export default router;
