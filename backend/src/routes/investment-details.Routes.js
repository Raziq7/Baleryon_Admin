// router/investorPortalRouter.js
import express from "express";
import {
  getInvestments,
  getPayouts,
  getUpcomingPayouts,
  getNonInvestedOpportunities
} from "../controller/investment-details.controller.js";
import { verifyToken } from "../middlewares/tokenVerification.js";

const router = express.Router();

// Get investments of the logged-in investor
router.get("/findInvestmentDetails", verifyToken, getInvestments);

// Get payouts of the logged-in investor
router.get("/payouts", verifyToken, getPayouts);

// Get upcoming payouts of the logged-in investor
router.get("/upcomingPayouts", verifyToken, getUpcomingPayouts);

// Get non-invested opportunities for the logged-in investor
router.get("/nonInvestedOpportunities", verifyToken, getNonInvestedOpportunities);

export default router;
