import { Router } from "express";
import { reportsController } from "./reports.controller.js";
import { authenticate } from "../../core/middleware/authenticate.js";

const router = Router();

// Routes
router.get("/overview", authenticate, reportsController.getOverview);

export const reportsRouter = router;
