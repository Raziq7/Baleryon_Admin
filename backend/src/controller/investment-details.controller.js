// controller/investorPortalController.js
import asyncHandler from "express-async-handler";
import {
  getInvestmentsService,
  getPayoutsService,
  getUpcomingPayoutsService,
  getNonInvestedOpportunitiesService,
} from "../services/investment-details.sevice.js";

// Get all investments for the logged-in investor
export const getInvestments = asyncHandler(async (req, res) => {
  const userId = req.user.id; // Get user ID from the token
  const investments = await getInvestmentsService(userId);
  res.status(200).json({ success: true, data: investments });
});

// Get all payouts for the logged-in investor
export const getPayouts = asyncHandler(async (req, res) => {
  const userId = req.user.id; // Get user ID from the token
  const payouts = await getPayoutsService(userId);
  res.status(200).json({ success: true, data: payouts });
});

// Get upcoming payouts for the logged-in investor
export const getUpcomingPayouts = asyncHandler(async (req, res) => {
  const userId = req.user.id; // Get user ID from the token
  const upcomingPayouts = await getUpcomingPayoutsService(userId);
  res.status(200).json({ success: true, data: upcomingPayouts });
});

// Get non-invested opportunities for the logged-in investor
export const getNonInvestedOpportunities = asyncHandler(async (req, res) => {
  const userId = req.user.id; // Get user ID from the token
  const nonInvestedOpportunities = await getNonInvestedOpportunitiesService(
    userId
  );
  res.status(200).json({ success: true, data: nonInvestedOpportunities });
});
