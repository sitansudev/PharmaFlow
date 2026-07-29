import { Router } from "express";
import { authController } from "./auth.controller.js";
import { authenticate } from "../../shared/middleware/auth.middleware.js";

const router = Router();

router.post("/register", authController.register.bind(authController));
router.post("/login", authController.login.bind(authController));
router.get("/me", authenticate, authController.me.bind(authController));

export default router;