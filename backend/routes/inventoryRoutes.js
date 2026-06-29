import express from "express";
import {
  getInventoryController,
  adjustInventoryController,
  getInventoryLogsController,
} from "../controller/inventoryController.js";

const router = express.Router();

router.get("/", getInventoryController);
router.get("/logs", getInventoryLogsController);
router.post("/:variantId/adjust", adjustInventoryController);

export default router;