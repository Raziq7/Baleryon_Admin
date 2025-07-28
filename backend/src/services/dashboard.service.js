import { prisma } from "../config/db.js";

// Get all investments for the logged-in investor
export const getInvestmentsService = async ({ userID }) => {
  const investments = await prisma.investment.findMany({
    where: { investorId: userID },
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

  return investments;
};

// Get all payouts for the logged-in investor
export const getPayoutsService = async (userId) => {
  // Fetch investments related to the investor
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
