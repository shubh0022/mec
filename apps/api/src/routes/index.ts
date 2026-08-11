import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import customerRoutes from "./customer.routes.js";
import productRoutes from "./product.routes.js";
import stockRoutes from "./stock.routes.js";
import challanRoutes from "./challan.routes.js";
import invoiceRoutes from "./invoice.routes.js";
import reportRoutes from "./report.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import auditRoutes from "./audit.routes.js";

const router = Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "VANTA ERP API",
    version: "1.0.0"
  });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/customers", customerRoutes);
router.use("/products", productRoutes);
router.use("/stock", stockRoutes);
router.use("/challans", challanRoutes);
router.use("/invoices", invoiceRoutes);
router.use("/reports", reportRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/audit-logs", auditRoutes);

export default router;
