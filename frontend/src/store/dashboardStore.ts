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
};



type InvestorPortalData = {
  investments: Investment[];
  payouts: Payout[];
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
      set((state) => {
        const prevData = state.data || { investments: [], payouts: [] };
        return {
          data: {
            ...prevData,
            investments,
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
      set((state) => {
        const prevData = state.data || { investments: [], payouts: [], };
        return {
          data: {
            ...prevData,
            payouts,
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
