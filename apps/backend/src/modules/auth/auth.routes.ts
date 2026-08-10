import { Router } from "express";

import { authController } from "./auth.controller.js";
import {
  registerSchema,
  loginSchema,
} from "./auth.validation.js";

import { authenticate } from "../../shared/middleware/auth.middleware.js";
import { validate } from "../../shared/middleware/validate.js";
import { loginRateLimiter } from "../../shared/middleware/rate-limit.js";
const router = Router();

router.post(
  "/register",
  validate(registerSchema),
  authController.register.bind(authController)
);

router.post(
  "/login",
  loginRateLimiter,
  validate(loginSchema),
  authController.login.bind(authController)
);

router.get(
  "/me",
  authenticate,
  authController.me.bind(authController)
);

export default router;