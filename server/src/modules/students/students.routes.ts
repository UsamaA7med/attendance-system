import { Router } from "express";
import { studentsController } from "./students.controller.js";
import { validate } from "../../core/middleware/validate.js";
import { authenticate, authorize } from "../../core/middleware/authenticate.js";
import {
  createStudentSchema,
  updateStudentSchema,
  enrollStudentSchema,
  queryStudentSchema,
} from "./students.schema.js";

const router = Router();

// Authentication required
router.use(authenticate);

// Student Read Endpoints (Admin, Staff, Teacher)
router.get("/metrics", authorize("admin", "staff", "teacher"), studentsController.getMetrics);
router.get("/", authorize("admin", "staff", "teacher"), validate({ query: queryStudentSchema }), studentsController.getAll);
router.get("/:id", authorize("admin", "staff", "teacher"), studentsController.getById);

// Student Write Endpoints (Admin, Staff only)
router.post("/", authorize("admin", "staff"), validate({ body: createStudentSchema }), studentsController.create);
router.post("/enroll", authorize("admin", "staff"), validate({ body: enrollStudentSchema }), studentsController.enroll);
router.put("/:id", authorize("admin", "staff"), validate({ body: updateStudentSchema }), studentsController.update);
router.patch("/:id", authorize("admin", "staff"), validate({ body: updateStudentSchema }), studentsController.update);
router.delete("/:id", authorize("admin", "staff"), studentsController.delete);

export const studentsRouter = router;
