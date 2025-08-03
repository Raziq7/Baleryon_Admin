import { create } from "zustand";
import { api } from "../services/api";
import axios from "axios";

// Define types for InvestmentOpportunity, Payout, and Investment
type InvestmentOpportunity = {
  id: string;
  name: string;
  brandName: string;
  description: string;
  minAmount: number;
  maxAmount: number | null;
  roiPercent: number;
  lockInMonths: number;
  exitOptions: string;
  payoutMode: string;
  isActive: boolean;
  documents: string[];
};

type Payout = {
  id: string;
  amountDue: number;
  amountPaid: number | null;
  dueDate: string;
  paidDate: string | null;
  paymentMode: string;
  receiptRef: string;
  notes: string | null;
  status: string;
};

type Investment = {
  id: string;
  investorId: string;
  opportunityId: string;
  amount: number;
  date: string;
  roiPercent: number;
  payoutMode: string;
  contractStart: string;
  contractEnd: string;
  paymentMethod: string;
  agreementSigned: boolean;
  status: string;
  opportunity: InvestmentOpportunity | null;
  payouts: Payout[];
  totalEarned: number;
  totalPending: number;
  totalSales: number;
  todaySalesAmount:number;
};

type InvestorPortalData = {
  investments: Investment[];
  payouts: Payout[];
  totalEarned: number;
  totalDueAmount: number;
  totalSales: number;
  lastSalesDate: string; 
  lastSalesAmount: number;
  todaySalesAmount: 0, 
};

type DashboardState = {
  data: InvestorPortalData;
  loading: boolean;
  error: string | null;
  fetchInvestments: () => Promise<void>;
  fetchPayouts: () => Promise<void>;
};

export const useDashboardStore = create<DashboardState>((set) => ({
  data: {
    investments: [],
    payouts: [],
    totalEarned: 0,
    totalDueAmount: 0,
    totalSales: 0,
    lastSalesDate: "N/A", 
    lastSalesAmount: 0, 
    todaySalesAmount: 0,
  },
  loading: false,
  error: null,

  // Update the `fetchInvestments` method in your store to include sales data

  fetchInvestments: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("auth_token");
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id;

      const response = await api.get(`/investor/findInvestmentDetails`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { userID: userId },
      });

      const investments = response.data?.data || [];

      // Calculate total earned and total due amount
      // const totalEarned = investments.reduce((sum, investment) => {
      //   return sum + (investment.totalEarned || 0);
      // }, 0);

      // const totalDueAmount = investments.reduce((sum, investment) => {
      //   return sum + (investment.totalPending || 0);
      // }, 0);

      // Calculate total earned and total due amount
      const totalEarned = investments.reduce(
        (sum: number, investment: Investment) => {
          return sum + (investment.totalEarned || 0); // Assuming `totalEarned` exists in the Investment object
        },
        0
      );

      const totalDueAmount = investments.reduce(
        (sum: number, investment: Investment) => {
          return sum + (investment.totalPending || 0); // Assuming `totalPending` exists in the Investment object
        },
        0
      );

      const totalSales = investments.reduce(
        (sum: number, investment: Investment) => {
          return sum + (investment.totalSales || 0); // Assuming `totalPending` exists in the Investment object
        },
        0
      );
console.log(totalSales,"totalSalestotalSalestotalSalestotalSales");

      const todaySalesAmount = investments.reduce(
        (sum: number, investment: Investment) => {
          return sum + (investment.todaySalesAmount || 0); // Assuming `totalPending` exists in the Investment object
        },
        0
      );

      

      // Calculate total sales and last sales date and amount

      let lastSalesDate = "";
      let lastSalesAmount = 0;
      // let todaySalesAmount = 0; 

      for (const investment of investments) {
        const opportunityId = investment.opportunityId;

        // Get total sales for each opportunity
        console.log(
          opportunityId,
          "opportunityIdopportunityIdopportunityIdopportunityId"
        );

        // const totalSalesForOpportunity = await getDailySales(opportunityId);
        // console.log(totalSalesForOpportunity,"totalSalesForOpportunitytotalSalesForOpportunitytotalSalesForOpportunity");

        // Get the most recent sale
        if (investment.payouts && investment.payouts.length > 0) {
          const latestPayout = investment.payouts[0];
          lastSalesDate = latestPayout.dueDate;
          lastSalesAmount = latestPayout.amountDue;
        }
      }

      set((state) => {
        const prevData = state.data || { investments: [], payouts: [] };
        return {
          data: {
            ...prevData,
            investments,
            totalEarned,
            totalDueAmount,
            totalSales,
            lastSalesDate,
            lastSalesAmount,
            todaySalesAmount
          },
          loading: false,
        };
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        set({
          error: err.response?.data?.message || "Failed to fetch investments",
          loading: false,
        });
      } else {
        set({ error: "Unexpected error occurred", loading: false });
      }
    }
  },

  // Fetch payouts for the investor
  fetchPayouts: async (): Promise<void> => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("auth_token");
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id;

      const response = await api.get(`/investor/payouts`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { userID: userId },
      });

      const payouts = response.data?.data || [];

      set((state: DashboardState) => {
        return {
          data: {
            ...state.data,
            payouts, // Update the payouts data while keeping existing investments, totalEarned, totalDueAmount, and totalSales
          },
          loading: false,
        };
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        set({
          error: err.response?.data?.message || "Failed to fetch payouts",
          loading: false,
        });
      } else {
        set({ error: "Unexpected error occurred", loading: false });
      }
    }
  },
}));

// // Helper function to fetch daily sales for an opportunity
// const getDailySales = async (opportunityId: string): Promise<number> => {
//   try {
//     const response = await api.get(`/dashboard/dailySales/${opportunityId}`);
//     console.log(response,"responseresponseresponseresponse");

//     return response.data; // Assuming response contains total sales for the opportunity
//   } catch (err) {
//     console.error("Failed to fetch daily sales:", err);
//     return 0;
//   }
// };
