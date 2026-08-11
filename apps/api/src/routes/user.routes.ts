import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validateBody, validateQuery } from "../middlewares/validate.middleware.js";
import { CreateUserSchema, UpdateUserSchema, PaginationQuerySchema, Role } from "@vanta/shared";

const router = Router();

router.use(authenticate);
router.use(authorize(Role.ADMIN));

router.get("/", validateQuery(PaginationQuerySchema), UserController.getUsers);
router.post("/", validateBody(CreateUserSchema), UserController.createUser);
router.patch("/:id", validateBody(UpdateUserSchema), UserController.updateUser);

export default router;
