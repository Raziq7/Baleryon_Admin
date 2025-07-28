// router/investorPortalRouter.js
import express from "express";
import {
  getInvestments,
  getPayouts,
  getUpcomingPayouts,  // New controller function
} from "../controller/investment-details.controller.js";
import { verifyToken } from "../middlewares/tokenVerification.js";

const router = express.Router();

// Get investments of the logged-in investor
router.get("/findInvestmentDetails", verifyToken, getInvestments);

// Get payouts of the logged-in investor
router.get("/payouts", verifyToken, getPayouts);


export default router;
