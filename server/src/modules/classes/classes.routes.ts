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

// Authentication and Admin authorization enforced
router.use(authenticate, authorize("admin"));

// Class CRUD Endpoints
router.get("/", validate({ query: queryClassSchema }), classesController.getAll);
router.get("/:id", classesController.getById);
router.post("/", validate({ body: createClassSchema }), classesController.create);
router.put("/:id", validate({ body: updateClassSchema }), classesController.update);
router.patch("/:id", validate({ body: updateClassSchema }), classesController.update);
router.delete("/:id", classesController.delete);

export const classesRouter = router;
