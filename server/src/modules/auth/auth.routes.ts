import { Router } from "express";
import { authController } from "./auth.controller.js";
import { validate } from "../../core/middleware/validate.js";
import { loginSchema, registerSchema, refreshTokenSchema } from "./auth.schema.js";
import { authenticate, authorize } from "../../core/middleware/authenticate.js";

const router = Router();

router.post("/login", validate({ body: loginSchema }), authController.login);
// Admin only can register staff accounts
router.post(
  "/register",
  authenticate,
  authorize("admin"),
  validate({ body: registerSchema }),
  authController.register
);
router.post("/refresh", validate({ body: refreshTokenSchema }), authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", authenticate, authController.getCurrentUser);

export const authRouter = router;
