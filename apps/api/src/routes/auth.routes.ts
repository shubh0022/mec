import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { LoginSchema } from "@vanta/shared";

const router = Router();

router.post("/login", validateBody(LoginSchema), AuthController.login);
router.get("/me", authenticate, AuthController.getMe);
router.post("/logout", authenticate, AuthController.logout);

export default router;
