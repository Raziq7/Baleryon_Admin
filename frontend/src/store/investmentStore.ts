import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../services/api";
import axios from "axios";

// Define the structure of an Investment Opportunity
export type InvestmentOpportunity = {
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

export type Payout = {
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
  payouts: Payout[]; // Including payouts in the investment object
};

// Define the state shape for investments and opportunities
type InvestmentState = {
  investments: Investment[];
  payouts: Payout[];
  upcomingPayouts: Payout[];
  nonInvestedOpportunities: InvestmentOpportunity[]; // Corrected type as an array
  selectedInvestment: Investment | null;
  loading: boolean;
  error: string | null;

  // Functions
  fetchInvestmentDetails: () => Promise<void>;
  fetchInvestmentById: (id: string) => Promise<void>;
  fetchPayouts: () => Promise<void>;
  fetchUpcomingPayouts: () => Promise<void>;
  fetchNonInvestedOpportunities: () => Promise<void>; // New function to fetch opportunities
};

export const useInvestmentStore = create<InvestmentState>()(
  persist(
    (set) => ({
      investments: [],
      payouts: [],
      upcomingPayouts: [],
      nonInvestedOpportunities: [], // Initialize as an array of InvestmentOpportunity
      selectedInvestment: null,
      loading: false,
      error: null,

      // Fetch investment details for the logged-in user
      fetchInvestmentDetails: async () => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem("auth_token");
          const userStr = localStorage.getItem("user");
          const user = userStr ? JSON.parse(userStr) : null;
          const userId = user?.id;

          const res = await api.get("/investor/findInvestmentDetails", {
            headers: { Authorization: `Bearer ${token}` },
            params: { userID: userId },
          });

          set({ investments: res.data?.data, loading: false });
        } catch (err) {
          handleError(err, set);
        }
      },

      // Fetch a specific investment by ID
      fetchInvestmentById: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem("auth_token");
          const res = await api.get(`/investor/findInvestmentDetails/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          set({ selectedInvestment: res.data?.data, loading: false });
        } catch (err) {
          handleError(err, set);
        }
      },

      // Fetch payouts for the logged-in user
      fetchPayouts: async () => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem("auth_token");
          const userStr = localStorage.getItem("user");
          const user = userStr ? JSON.parse(userStr) : null;
          const userId = user?.id;

          const response = await api.get("/investor/payouts", {
            headers: { Authorization: `Bearer ${token}` },
            params: { userID: userId },
          });

          const payouts = response.data?.data || [];
          set({ payouts, loading: false });
        } catch (err) {
          handleError(err, set);
        }
      },

      // Fetch upcoming payouts for the logged-in user
      fetchUpcomingPayouts: async () => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem("auth_token");
          const userStr = localStorage.getItem("user");
          const user = userStr ? JSON.parse(userStr) : null;
          const userId = user?.id;

          const response = await api.get("/investor/upcomingPayouts", {
            headers: { Authorization: `Bearer ${token}` },
            params: { userID: userId },
          });

          const upcomingPayouts = response.data?.data || [];
          set({ upcomingPayouts, loading: false });
        } catch (err) {
          handleError(err, set);
        }
      },

      // Fetch all investment opportunities that the logged-in user hasn't invested in yet
      fetchNonInvestedOpportunities: async () => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem("auth_token");
          const userStr = localStorage.getItem("user");
          const user = userStr ? JSON.parse(userStr) : null;
          const userId = user?.id;

          const response = await api.get("/investor/nonInvestedOpportunities", {
            headers: { Authorization: `Bearer ${token}` },
            params: { userID: userId },
          });
          
          const opportunities = response.data?.data || [];
          set({ nonInvestedOpportunities: opportunities, loading: false });
        } catch (err) {
          console.error("Error fetching non-invested opportunities:", err); // Log the error
          set({
            error: "Failed to fetch non-invested opportunities",
            loading: false,
          });
        }
      },
    }),
    {
      name: "investment-storage", // Store name
    }
  )
);

// Helper error handler
function handleError(
  err: unknown,
  set: (partial: Partial<InvestmentState>) => void
) {
  if (axios.isAxiosError(err)) {
    const message = err.response?.data?.message || "Request failed";
    set({ error: message, loading: false });
  } else {
    set({ error: "An unexpected error occurred", loading: false });
  }
}
