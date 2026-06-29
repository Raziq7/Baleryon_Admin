import express from "express";

import {
  getReportDashboardController,
  downloadReportController,
} from "../controller/reportController.js";

const router = express.Router();

router.get(
  "/dashboard",
  getReportDashboardController
);

router.get(
  "/download",
  downloadReportController
);

export default router;