import express from "express";
import { findInvestmentDetails } from "../controller/investment-details.controller.js";

const router = express.Router();

router.get("/findInvestmentDetails", findInvestmentDetails);

export default router;
