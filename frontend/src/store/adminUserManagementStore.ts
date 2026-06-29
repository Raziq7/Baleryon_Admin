import { create } from "zustand";
import axios from "axios";
import { api } from "../services/api";

export type UserStatusFilter =
  | "all"
  | "active"
  | "blocked"
  | "verified"
  | "unverified"
  | "purchased";

export type AdminCustomerUser = {
  _id: string;
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phone?: string | null;
  role: string;
  isActive: boolean;
  isBlocked: boolean;
  isVerified: boolean;
  orderCount: number;
  provider?: string;
  lastLogin?: string | null;
  createdAt: string;
  updatedAt: string;
};

type UsersResponse = {
  users: AdminCustomerUser[];
  pageNo: number;
  totalPages: number;
  totalUsers: number;
};


type AdminUserManagementState = {
  users: AdminCustomerUser[];
  pageNo: number;
  totalPages: number;
  totalUsers: number;
  loading: boolean;
  error: string | null;
  statusFilter: UserStatusFilter;
  search: string;

  fetchUsers: (
    status?: UserStatusFilter,
    page?: number,
    search?: string
  ) => Promise<void>;
  setStatusFilter: (status: UserStatusFilter) => void;
  setSearch: (search: string) => void;
  toggleBlockUser: (id: string, isBlocked: boolean) => Promise<void>;
  toggleVerifyUser: (id: string, isVerified: boolean) => Promise<void>;
};

function authHeaders() {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function handleError(
  err: unknown,
  set: (partial: Partial<AdminUserManagementState>) => void
) {
  if (axios.isAxiosError(err)) {
    set({
      error: err.response?.data?.message || "Request failed",
      loading: false,
    });
  } else {
    set({ error: "An unexpected error occurred", loading: false });
  }
}

export function getUserDisplayName(user: AdminCustomerUser): string {
  if (user.fullName?.trim()) return user.fullName;
  return [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "—";
}

export const useAdminUserManagementStore = create<AdminUserManagementState>(
  (set, get) => ({
    users: [],
    pageNo: 1,
    totalPages: 1,
    totalUsers: 0,
    loading: false,
    error: null,
    statusFilter: "all",
    search: "",

    setStatusFilter: (status) => set({ statusFilter: status, pageNo: 1 }),
    setSearch: (search) => set({ search, pageNo: 1 }),

    fetchUsers: async (status, page, search) => {
      const state = get();
      const nextStatus = status ?? state.statusFilter;
      const nextPage = page ?? state.pageNo;
      const nextSearch = search ?? state.search;

      set({ loading: true, error: null, statusFilter: nextStatus, pageNo: nextPage, search: nextSearch });

      try {
        // const res = await api.get<UsersResponse>("/admin/userManagment/", {
        //   headers: authHeaders(),
        //   params: {
        //     status: nextStatus,
        //     page: nextPage,
        //     limit: 10,
        //     search: nextSearch || undefined,
        //   },
        // });

        const res = await api.get<UsersResponse>(
          "/admin/userManagment/",
          {
            headers: authHeaders(),
            params: {
              status: nextStatus,
              page: nextPage,
              limit: 10,
              search: nextSearch || undefined,
            },
          }
        );

        console.log("API RESPONSE:", res.data);

        set({
          users: res.data.users || [],
          pageNo: res.data.pageNo || nextPage,
          totalPages: res.data.totalPages || 1,
          totalUsers: res.data.totalUsers || 0,
          loading: false,
        });
      } catch (err) {
        handleError(err, set);
      }
    },

    toggleBlockUser: async (id, isBlocked) => {
      set({ loading: true, error: null });
      try {
        await api.patch(
          `/admin/userManagment/${id}/block`,
          { isBlocked },
          { headers: authHeaders() }
        );
        await get().fetchUsers();
      } catch (err) {
        handleError(err, set);
        throw err;
      }
    },

    toggleVerifyUser: async (id, isVerified) => {
      set({ loading: true, error: null });
      try {
        await api.put(
          `/admin/userManagment/${id}`,
          { isVerified },
          { headers: authHeaders() }
        );
        await get().fetchUsers();
      } catch (err) {
        handleError(err, set);
        throw err;
      }
    },
  })
);
