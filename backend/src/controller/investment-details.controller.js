import asyncHandler from "express-async-handler";
import { investmentDetailsFind } from "../services/investment-details.sevice.js";

// // @desc    investment details find controller
// // @route   GET /api/investor/findInvestmentDetails
// // @access  Public
export const findInvestmentDetails = asyncHandler(async (req, res) => {

    try {

        const userID = req.query.userID
        const investmentDetails = await investmentDetailsFind(userID);

        console.log(userID, "eeeeeeeeeeeeeeeeeeeeee")
        res.status(201).json(investmentDetails);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

