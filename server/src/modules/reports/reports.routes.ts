import { Router } from "express";
import { reportsController } from "./reports.controller.js";
import { authenticate, authorize } from "../../core/middleware/authenticate.js";

const router = Router();

// Routes — Admin and Staff only
router.get("/overview", authenticate, authorize("admin", "staff"), reportsController.getOverview);

export const reportsRouter = router;
