import express from "express";
import {
  createWarehouseController,
  generateShipmentController,
} from "../controller/shipment.controller.js";

const router = express.Router();

router.post("/create/:orderId", generateShipmentController);

router.use("/api/warehouse", createWarehouseController);

export default router;
