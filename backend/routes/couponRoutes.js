import express from "express";
import {
  createCouponController,
  getCouponsController,
  updateCouponController,
  deleteCouponController,
  validateCouponController,
} from "../controller/couponController.js";

const router = express.Router();

router.get("/", getCouponsController);
router.post("/", createCouponController);
router.put("/:id", updateCouponController);
router.delete("/:id", deleteCouponController);

// public / checkout usage
router.post("/validate", validateCouponController);

export default router;