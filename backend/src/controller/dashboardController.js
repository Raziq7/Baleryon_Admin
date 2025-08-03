import asyncHandler from "express-async-handler";
import { getInvestmentsService, getPayoutsService } from "../services/dashboard.service.js";

// @desc    Get all investments for the logged-in investor
// @route   GET /api/dashboard/investments
// @access  Private
export const getInvestments = asyncHandler(async (req, res) => {
  const userId = req.user.id; // Get user ID from the token
  const investments = await getInvestmentsService(userId);
  res.status(200).json({ success: true, data: investments });
});

// @desc    Get all payouts for the logged-in investor
// @route   GET /api/dashboard/payouts
// @access  Private
export const getPayouts = asyncHandler(async (req, res) => {
  const userId = req.user.id;  // Get user ID from the token
  const payouts = await getPayoutsService(userId);
  res.status(200).json({ success: true, data: payouts });
});