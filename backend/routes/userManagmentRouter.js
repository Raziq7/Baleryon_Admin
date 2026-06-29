import express from "express";
import {
  createUserController,
  getUserByIdController,
  getUserDetailsController,
  getUsersController,
  toggleBlockUserController,
  updateUserController,
} from "../controller/userManagmentController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// router.use(protect, admin);

router.post("/create", createUserController);
router.get("/", getUsersController);
router.get("/userDetails", getUserByIdController);
router.get(
  "/:id/details",
  // protectAdmin,
  getUserDetailsController
);
router.put("/:id", updateUserController);
router.patch("/:id/block", toggleBlockUserController);

export default router;
