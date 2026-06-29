import express from "express";
import {
  loginController,
//   meController,
  createAdminController,
//   getAdminsController,
} from "../controller/authController.js";
// import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// PUBLIC
router.post("/login", loginController);

/*
 * CREATE ADMIN (SUPER ADMIN ONLY)
 */
router.post(
  "/create",
  //   protect,
  createAdminController,
);

/**
 * GET ALL ADMINS
 */
// router.get("/all", protect, getAdminsController);

// PROTECTED
// router.get("/me", protect, meController);

export default router;
