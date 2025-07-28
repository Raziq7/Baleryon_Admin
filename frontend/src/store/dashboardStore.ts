import { create } from "zustand";
import { api } from "../services/api";
import axios from "axios";

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
  totalDueAmount: number;
};

type InvestorPortalData = {
  investments: Investment[];
  payouts: Payout[];
  totalEarned: number; // Add totalEarned
  totalDueAmount: number; // Add totalDueAmount
};

type DashboardState = {
  data: InvestorPortalData | null;
  loading: boolean;
  error: string | null;
  fetchInvestments: () => Promise<void>;
  fetchPayouts: () => Promise<void>;
};

export const useDashboardStore = create<DashboardState>((set) => ({
  data: null,
  loading: false,
  error: null,

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

      set((state) => {
        const prevData = state.data || { investments: [], payouts: [] };
        return {
          data: {
            ...prevData,
            investments,
            totalEarned, // Add totalEarned here
            totalDueAmount, // Add totalDueAmount here
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

  fetchPayouts: async () => {
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

      // Update the state with new payouts data while keeping existing investments
      set((state: DashboardState) => {
        const prevData = state.data || {
          investments: [],
          payouts: [],
          totalEarned: 0,
          totalDueAmount: 0,
        }; // Ensure all fields are initialized

        return {
          data: {
            ...prevData,
            payouts
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
