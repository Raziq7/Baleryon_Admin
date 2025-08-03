// router/investorPortalRouter.js
import express from "express";
import {
  getInvestments,
  getPayouts,
  getUpcomingPayouts,  // New controller function
  getDailySales
} from "../controller/investment-details.controller.js";
import { verifyToken } from "../middlewares/tokenVerification.js";

const router = express.Router();

// Get investments of the logged-in investor
router.get("/findInvestmentDetails", verifyToken, getInvestments);

// Get payouts of the logged-in investor
router.get("/payouts", verifyToken, getPayouts);

// Get daily sales for a specific opportunity
router.get("/dailySales/:opportunityId/:date", verifyToken, getDailySales);


export default router;
