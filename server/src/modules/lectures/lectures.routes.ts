import { Router } from "express";
import { lecturesController } from "./lectures.controller.js";
import { validate } from "../../core/middleware/validate.js";
import { authenticate, authorize } from "../../core/middleware/authenticate.js";
import {
  createLectureSchema,
  updateLectureSchema,
  queryLectureSchema,
  updateLectureAttendanceSchema,
} from "./lectures.schema.js";

const router = Router();

// Authentication and Admin / Staff / Teacher authorization
router.use(authenticate, authorize("admin", "staff", "teacher"));

// Lectures Endpoints
router.get("/", validate({ query: queryLectureSchema }), lecturesController.getAll);
router.get("/:id", lecturesController.getById);
router.post("/", validate({ body: createLectureSchema }), lecturesController.create);
router.put("/:id", validate({ body: updateLectureSchema }), lecturesController.update);
router.patch("/:id", validate({ body: updateLectureSchema }), lecturesController.update);
router.delete("/:id", lecturesController.delete);

// Lecture Attendance roll-call
router.get("/:id/attendance", lecturesController.getAttendance);
router.put(
  "/:id/attendance",
  validate({ body: updateLectureAttendanceSchema }),
  lecturesController.updateAttendance
);

export const lecturesRouter = router;
