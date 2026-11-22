import { Router } from "express";
import { attendanceController } from "./attendance.controller.js";
import { validate } from "../../core/middleware/validate.js";
import {
  checkInSchema,
  checkOutSchema,
  attendanceQuerySchema,
} from "./attendance.schema.js";

const router = Router();

router.get("/summary/today", attendanceController.getTodaySummary);
router.get("/", validate({ query: attendanceQuerySchema }), attendanceController.getAll);
router.get("/:id", attendanceController.getById);
router.post("/check-in", validate({ body: checkInSchema }), attendanceController.checkIn);
router.post("/check-out", validate({ body: checkOutSchema }), attendanceController.checkOut);

export const attendanceRouter = router;
