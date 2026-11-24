import { Router } from "express";
import { classesController } from "./classes.controller.js";
import { validate } from "../../core/middleware/validate.js";
import { authenticate, authorize } from "../../core/middleware/authenticate.js";
import {
  createClassSchema,
  updateClassSchema,
  queryClassSchema,
} from "./classes.schema.js";

const router = Router();

// Authentication required for all endpoints
router.use(authenticate);

// Read Endpoints: accessible to both Admin and Staff
router.get("/", authorize("admin", "staff"), validate({ query: queryClassSchema }), classesController.getAll);
router.get("/:id", authorize("admin", "staff"), classesController.getById);

// Write Endpoints: Admin only
router.post("/", authorize("admin"), validate({ body: createClassSchema }), classesController.create);
router.put("/:id", authorize("admin"), validate({ body: updateClassSchema }), classesController.update);
router.patch("/:id", authorize("admin"), validate({ body: updateClassSchema }), classesController.update);
router.delete("/:id", authorize("admin"), classesController.delete);

export const classesRouter = router;
