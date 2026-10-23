import express from "express";
import {
  createWarehouseController,
  generateShipmentController,
  cancelShipmentController,
  trackShipmentController,
} from "../controller/shipment.controller.js";

const router = express.Router();

router.post("/create/:orderId", generateShipmentController);

router.post("/cancel/:orderId", cancelShipmentController);

router.get("/track/:orderId", trackShipmentController);

router.post("/warehouse", createWarehouseController);

export default router;
