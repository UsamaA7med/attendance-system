import { Router } from "express";
import { staffController } from "./staff.controller.js";
import { validate } from "../../core/middleware/validate.js";
import { authenticate, authorize } from "../../core/middleware/authenticate.js";
import {
  createStaffSchema,
  updateStaffSchema,
  queryStaffSchema,
} from "./staff.schema.js";

const router = Router();

// Enforce authentication & admin authorization for all staff CRUD endpoints
router.use(authenticate, authorize("admin"));

// Staff CRUD Routes
router.get("/metrics", staffController.getMetrics);
router.get("/", validate({ query: queryStaffSchema }), staffController.getAll);
router.get("/:id", staffController.getById);
router.post("/", validate({ body: createStaffSchema }), staffController.create);
router.put("/:id", validate({ body: updateStaffSchema }), staffController.update);
router.patch("/:id", validate({ body: updateStaffSchema }), staffController.update);
router.delete("/:id", staffController.delete);

export const staffRouter = router;
