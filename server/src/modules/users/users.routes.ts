import { Router } from "express";
import { usersController } from "./users.controller.js";
import { validate } from "../../core/middleware/validate.js";
import { createUserSchema, updateUserSchema } from "./users.schema.js";
import { authenticate, authorize } from "../../core/middleware/authenticate.js";

const router = Router();

// Routes
router.get("/", authenticate, usersController.getAll);
router.get("/:id", authenticate, usersController.getById);
router.post(
  "/",
  authenticate,
  authorize("admin"),
  validate({ body: createUserSchema }),
  usersController.create
);
router.patch(
  "/:id",
  authenticate,
  authorize("admin"),
  validate({ body: updateUserSchema }),
  usersController.update
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  usersController.delete
);

export const usersRouter = router;
