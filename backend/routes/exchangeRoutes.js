import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getExchangeRequestsController,
  getExchangeRequestDetailsController,
  approveExchangeController,
  rejectExchangeController,
  completeExchangeController,
  retryExchangeShipmentController,
} from "../controller/exchangeController.js";

const router = express.Router();

router.get("/", protect, getExchangeRequestsController);
router.get("/:id", protect, getExchangeRequestDetailsController);
router.post("/:id/approve", protect, approveExchangeController);
router.post("/:id/reject", protect, rejectExchangeController);
router.post("/:id/complete", protect, completeExchangeController);
router.post("/:id/retry-shipment", protect, retryExchangeShipmentController);

export default router;
