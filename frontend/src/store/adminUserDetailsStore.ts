import { create } from "zustand";
import axios from "axios";

import { api } from "../services/api";
import type {
  UserDetails,
  UserStats,
  Order,
  Payment,
  Address,
  Product,
  Activity,
  Tracking,
  UserDetailsResponse,
} from "../components/users/userDetails/types";

// ------------------------------------
// State interface
// ------------------------------------

interface AdminUserDetailsState {
  user: UserDetails | null;
  stats: UserStats | null;
  orders: Order[];
  payments: Payment[];
  addresses: Address[];
  products: Product[];
  activities: Activity[];
  tracking: Tracking[];
  loading: boolean;
  error: string | null;
  fetchUserDetails: (userId: string) => Promise<void>;
  clearUserDetails: () => void;
}

// ------------------------------------
// Helpers
// ------------------------------------

function authHeaders() {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const emptyState = {
  user: null,
  stats: null,
  orders: [],
  payments: [],
  addresses: [],
  products: [],
  activities: [],
  tracking: [],
  loading: false,
  error: null,
} satisfies Partial<AdminUserDetailsState>;

// ------------------------------------
// Store
// ------------------------------------

export const useAdminUserDetailsStore = create<AdminUserDetailsState>((set) => ({
  ...emptyState,

  fetchUserDetails: async (userId: string) => {
    set({ loading: true, error: null });

    try {
      const res = await api.get<UserDetailsResponse>(
        `/admin/userManagment/${userId}/details`,
        { headers: authHeaders() }
      );

      const data = res.data;

      set({
        user:       data.user,
        stats:      data.stats,
        orders:     data.orders     ?? [],
        payments:   data.payments   ?? [],
        addresses:  data.addresses  ?? [],
        products:   data.products   ?? [],
        activities: data.activities ?? [],
        tracking:   data.tracking   ?? [],
        loading:    false,
      });
    } catch (err) {
      set({
        loading: false,
        error: axios.isAxiosError(err)
          ? err.response?.data?.message ?? "Failed to fetch user details"
          : "Unexpected error occurred",
      });
    }
  },

  clearUserDetails: () => set(emptyState),
}));