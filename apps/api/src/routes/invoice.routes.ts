import { Router } from "express";
import { InvoiceController } from "../controllers/invoice.controller.js";
import { authenticate, authorize, protectReadOnlyGuest } from "../middlewares/auth.middleware.js";
import { validateBody, validateQuery } from "../middlewares/validate.middleware.js";
import { CreateInvoiceSchema, UpdateInvoiceStatusSchema, PaginationQuerySchema, Role } from "@vanta/shared";

const router = Router();

router.use(authenticate);
router.use(protectReadOnlyGuest);

// List & view invoices: ADMIN, ACCOUNTS, SALES, GUEST
router.get(
  "/",
  authorize(Role.ADMIN, Role.ACCOUNTS, Role.SALES, Role.GUEST),
  validateQuery(PaginationQuerySchema),
  InvoiceController.getInvoices
);

router.get("/:id", authorize(Role.ADMIN, Role.ACCOUNTS, Role.SALES, Role.GUEST), InvoiceController.getInvoiceById);

// Generate invoice from challan: ADMIN, ACCOUNTS
router.post(
  "/generate",
  authorize(Role.ADMIN, Role.ACCOUNTS),
  validateBody(CreateInvoiceSchema),
  InvoiceController.generateInvoice
);

// Update status (Mark Paid, Cancel): ADMIN, ACCOUNTS
router.patch(
  "/:id/status",
  authorize(Role.ADMIN, Role.ACCOUNTS),
  validateBody(UpdateInvoiceStatusSchema),
  InvoiceController.updateStatus
);

export default router;
