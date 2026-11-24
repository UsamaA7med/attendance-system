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

// Read Endpoints: accessible to Admin, Staff, and Teacher
router.get("/metrics", authorize("admin", "staff", "teacher"), classesController.getMetrics);
router.get("/", authorize("admin", "staff", "teacher"), validate({ query: queryClassSchema }), classesController.getAll);
router.get("/:id", authorize("admin", "staff", "teacher"), classesController.getById);

// Write Endpoints: Admin and Teacher
router.post("/", authorize("admin", "teacher"), validate({ body: createClassSchema }), classesController.create);
router.put("/:id", authorize("admin", "teacher"), validate({ body: updateClassSchema }), classesController.update);
router.patch("/:id", authorize("admin", "teacher"), validate({ body: updateClassSchema }), classesController.update);
router.delete("/:id", authorize("admin", "teacher"), classesController.delete);

export const classesRouter = router;
