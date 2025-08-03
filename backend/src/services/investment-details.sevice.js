import { prisma } from "../config/db.js";

// Helper function to calculate total sales for a specific opportunity in a given month
export const calculateTotalSales = async (opportunityId, month, year) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const findsales = await prisma.sales.findMany({
    where: {
      opportunityId,
      date: {
        gte: new Date(year, month - 1, 1),
        lte: new Date(year, month - 1, daysInMonth),
      },
    },
  });
  return findsales.reduce((sum, sale) => sum + sale.amount, 0); // Sum the sales amounts
};

// Helper function to calculate today's sales for an opportunity
export const calculateTodaysSales = async (opportunityId) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)); // Start of today
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)); // End of today

  const todaysSales = await prisma.sales.findMany({
    where: {
      opportunityId,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  return todaysSales.reduce((sum, sale) => sum + sale.amount, 0); // Sum the sales amounts
};

// Helper function to get the last sales for each opportunity
export const getLastSale = async (opportunityId) => {
  const lastSale = await prisma.sales.findFirst({
    where: { opportunityId },
    orderBy: { date: 'desc' },  // Fetch the most recent sale
  });

  if (!lastSale) return { lastSalesDate: null, lastSalesAmount: 0 };

  return {
    lastSalesDate: lastSale.date,
    lastSalesAmount: lastSale.amount,
  };
};

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
      (sum, payout) => sum + (payout.amountPaid || 0),
      0
    );

    // Calculate total pending amount (amountDue - amountPaid)
    const totalPending = investment.payouts.reduce(
      (sum, payout) => sum + (payout.amountDue - (payout.amountPaid || 0)),
      0
    );

    return {
      ...investment,
      totalEarned: totalPaid,
      totalPending: totalPending,
    };
  });

  // Calculate total sales for each opportunity and add last sales date and amount
  for (const investment of investmentsWithEarnings) {
    const opportunityId = investment.opportunityId;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Months are 0-indexed
    const currentYear = currentDate.getFullYear();

    // Calculate daily sales for the opportunity
    const totalSales = await calculateTotalSales(opportunityId, currentMonth, currentYear);
    const todaysSales = await calculateTodaysSales(opportunityId);
    


    // Fetch last sales date and amount
    const { lastSalesDate, lastSalesAmount } = await getLastSale(opportunityId);

    investment.totalSales = totalSales;
    investment.lastSalesDate = lastSalesDate;  // Add last sale date
    investment.lastSalesAmount = lastSalesAmount;  // Add last sale amount
    investment.todaySalesAmount = todaysSales; // Today's sales

  }

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

  return nonInvestedOpportunities;
};


// Helper function to calculate total sales for a specific opportunity on a given day
export const getDailySalesService = async (opportunityId, date) => {
  try {
    // Get the total sales for the opportunity on the given date
    const sales = await prisma.sales.findMany({
      where: {
        opportunityId,
        date: {
          gte: new Date(date.setHours(0, 0, 0, 0)), // Start of the day
          lte: new Date(date.setHours(23, 59, 59, 999)), // End of the day
        },
      },
    });

    // Calculate the total sales amount
    const totalSales = sales.reduce((sum, sale) => sum + sale.amount, 0);
    
    return totalSales;
  } catch (error) {
    console.error("Failed to fetch daily sales:", error);
    throw new Error("Failed to fetch daily sales");
  }
};
