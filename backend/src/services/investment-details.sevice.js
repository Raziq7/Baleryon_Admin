// services/investment-details.service.js
import { prisma } from "../config/db.js";

// Get all investments for a specific investor
// Get all investments for a specific investor
export const getInvestmentsService = async (userId) => {
  // Fetch investments and calculate total earnings and pending amount
  const investments = await prisma.investment.findMany({
    where: { investorId: userId },
    include: {
      opportunity: {
        include: {
          investmentType: true,
          businessCategory: true,
        },
      },
      payouts: true,
    },
  });

  // If no investments found, throw an error
  if (!investments || investments.length === 0) {
    throw new Error("No investments found");
  }

  // Add total earned and total pending calculations to each investment
  const investmentsWithEarnings = investments.map((investment) => {
    // Calculate total amount paid (earnings)
    const totalPaid = investment.payouts.reduce(
      (sum, payout) => sum + (payout.amountPaid || 0), // Sum amountPaid for each payout
      0
    );

    // Calculate total pending amount (amountDue - amountPaid)
    const totalPending = investment.payouts.reduce(
      (sum, payout) => sum + (payout.amountDue - (payout.amountPaid || 0)), // Calculate remaining amount
      0
    );

    // Add these totals to the investment object
    return {
      ...investment,
      totalEarned: totalPaid, // Add total earned
      totalPending: totalPending, // Add total pending
    };
  });

  return investmentsWithEarnings;
};


// Get all payouts for the logged-in investor
export const getPayoutsService = async (userId) => {
  // Fetch the investments related to the investor
  const investments = await prisma.investment.findMany({
    where: {
      investorId: userId, // Find investments for the logged-in investor
    },
    include: {
      payouts: true, // Include associated payouts for each investment
    },
  });

  // Extract payouts from the fetched investments
  const payouts = investments.flatMap((investment) => investment.payouts);

  return payouts;
};

// Get upcoming payouts for the logged-in investor
export const getUpcomingPayoutsService = async (userId) => {
  const upcomingPayouts = await prisma.payout.findMany({
    where: {
      investment: {
        investorId: userId,
      },
      dueDate: {
        gte: new Date(),
      },
    },
    orderBy: {
      dueDate: "asc",
    },
  });

  if (!upcomingPayouts || upcomingPayouts.length === 0) {
    throw new Error("No upcoming payouts found");
  }

  return upcomingPayouts;
};


// Get all investment opportunities that the logged-in investor hasn't invested in
export const getNonInvestedOpportunitiesService = async (userId) => {
  // Fetch all investment opportunities
  const allOpportunities = await prisma.investmentOpportunity.findMany({
    where: {
      isActive: true, 
    },
  });

  // Fetch the investments for the logged-in investor
  const investorInvestments = await prisma.investment.findMany({
    where: {
      investorId: userId, // Get investments by this investor
    },
    select: {
      opportunityId: true, // Only get the opportunity ids
    },
  });

  // Extract opportunity IDs that the investor has already invested in
  const investedOpportunityIds = investorInvestments.map(
    (investment) => investment.opportunityId
  );

  // Filter out the opportunities that the investor has already invested in
  const nonInvestedOpportunities = allOpportunities.filter(
    (opportunity) => !investedOpportunityIds.includes(opportunity.id)
  );

  console.log(nonInvestedOpportunities,"nonInvestedOpportunitiesnonInvestedOpportunitiesnonInvestedOpportunitiesnonInvestedOpportunities");
  
  return nonInvestedOpportunities;
};
