import { Router } from "express";
import { authController } from "./auth.controller.js";
import { validate } from "../../core/middleware/validate.js";
import { loginSchema, registerSchema } from "./auth.schema.js";
import { authenticate } from "../../core/middleware/authenticate.js";

const router = Router();

router.post("/login", validate({ body: loginSchema }), authController.login);
router.post("/register", validate({ body: registerSchema }), authController.register);
router.get("/me", authenticate, authController.getCurrentUser);

export const authRouter = router;
