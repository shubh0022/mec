import { Router } from "express";
import { InvoiceController } from "../controllers/invoice.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validateBody, validateQuery } from "../middlewares/validate.middleware.js";
import { CreateInvoiceSchema, UpdateInvoiceStatusSchema, PaginationQuerySchema, Role } from "@vanta/shared";

const router = Router();

router.use(authenticate);

// List & view invoices: ADMIN, ACCOUNTS, SALES
router.get(
  "/",
  authorize(Role.ADMIN, Role.ACCOUNTS, Role.SALES),
  validateQuery(PaginationQuerySchema),
  InvoiceController.getInvoices
);

router.get("/:id", authorize(Role.ADMIN, Role.ACCOUNTS, Role.SALES), InvoiceController.getInvoiceById);

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
