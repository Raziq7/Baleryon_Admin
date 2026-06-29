import express from "express";
import {
  getOrdersController,
  getOrderDetailsController,
  updateOrderStatusController,
} from "../controller/orderController.js";

const router = express.Router();

router.get("/getOrders", getOrdersController);

router.get("/orderDetails/:id", getOrderDetailsController);

router.put("/updateStatus/:id", updateOrderStatusController);

export default router;