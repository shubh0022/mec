import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { LoginSchema, GoogleVerifySchema } from "@vanta/shared";

const router = Router();

// Primary Email + Password
router.post("/login", validateBody(LoginSchema), AuthController.login);

// Continue as Guest / Demo Session
router.post("/guest", AuthController.guestLogin);

// Google Identity Services ID Token Verification (One Tap / GIS Button)
router.post("/google/verify", validateBody(GoogleVerifySchema), AuthController.verifyGoogleIdToken);

// Google OAuth 2.0 Authorization Flow
router.get("/google", AuthController.getGoogleAuthUrl);
router.get("/google/callback", AuthController.handleGoogleCallback);

// Authenticated session introspection & logout
router.get("/me", authenticate, AuthController.getMe);
router.post("/logout", authenticate, AuthController.logout);

export default router;
