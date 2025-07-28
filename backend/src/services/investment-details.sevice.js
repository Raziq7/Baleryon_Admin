// services/investment-details.service.js
import { prisma } from "../config/db.js";

// Get all investments for a specific investor
export const getInvestmentsService = async (userId) => {
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

  if (!investments || investments.length === 0) {
    throw new Error("No investments found");
  }

  return investments;
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
