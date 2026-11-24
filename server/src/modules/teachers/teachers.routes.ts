import { Router } from "express";
import { teachersController } from "./teachers.controller.js";
import { validate } from "../../core/middleware/validate.js";
import { authenticate, authorize } from "../../core/middleware/authenticate.js";
import {
  createTeacherSchema,
  updateTeacherSchema,
  queryTeacherSchema,
} from "./teachers.schema.js";

const router = Router();

// Enforce authentication & admin authorization for all teacher CRUD endpoints
router.use(authenticate, authorize("admin"));

// Teacher CRUD Routes
router.get("/metrics", teachersController.getMetrics);
router.get("/", validate({ query: queryTeacherSchema }), teachersController.getAll);
router.get("/:id", teachersController.getById);
router.post("/", validate({ body: createTeacherSchema }), teachersController.create);
router.put("/:id", validate({ body: updateTeacherSchema }), teachersController.update);
router.patch("/:id", validate({ body: updateTeacherSchema }), teachersController.update);
router.delete("/:id", teachersController.delete);

export const teachersRouter = router;
