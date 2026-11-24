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

// Authentication and Admin / Staff authorization enforced
router.use(authenticate, authorize("admin", "staff"));

// Student Endpoints
router.get("/", validate({ query: queryStudentSchema }), studentsController.getAll);
router.get("/:id", studentsController.getById);
router.post("/", validate({ body: createStudentSchema }), studentsController.create);
router.post("/enroll", validate({ body: enrollStudentSchema }), studentsController.enroll);
router.put("/:id", validate({ body: updateStudentSchema }), studentsController.update);
router.patch("/:id", validate({ body: updateStudentSchema }), studentsController.update);
router.delete("/:id", studentsController.delete);

export const studentsRouter = router;
