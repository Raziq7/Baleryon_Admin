import { create } from "zustand";
import { api } from "../services/api";

export type ExchangeStatus =
  | "REQUESTED"
  | "APPROVED"
  | "REJECTED"
  | "REFUNDED"
  | "COMPLETED";

export type ExchangeRequest = {
  id: string;
  orderItemId: string;
  type: string;
  reason: string | null;
  status: ExchangeStatus;
  desiredVariantId: string | null;
  adminNote: string | null;
  pickupShipmentId: string | null;
  replacementShipmentId: string | null;
  createdAt: string;
  respondedAt: string | null;

  desiredVariant?: {
    id: string;
    color: string | null;
    size: string | null;
    stock: number | null;
  } | null;

  orderItem: {
    id: string;
    productName: string | null;
    order: {
      id: string;
      orderNumber: string;
      user: {
        id: string;
        fullName: string;
        email: string;
      };
    };
    product: {
      id: string;
      title: string;
    } | null;
    variant: {
      id: string;
      color: string | null;
      size: string | null;
    } | null;
  };
};

function authHeaders() {
  const token = localStorage.getItem("auth_token");
  return { Authorization: `Bearer ${token}` };
}

function extractErrorMessage(err: unknown, fallback: string): string {
  const maybeAxiosError = err as {
    response?: { data?: { message?: string } };
  };
  return maybeAxiosError?.response?.data?.message || fallback;
}

type ExchangeStore = {
  exchangeRequests: ExchangeRequest[];
  loading: boolean;
  error: string | null;

  pageNo: number;
  totalPages: number;

  actionLoadingId: string | null;

  fetchExchangeRequests: (opts?: { status?: string; orderId?: string; page?: number }) => Promise<void>;
  approveExchange: (id: string) => Promise<void>;
  rejectExchange: (id: string, adminNote: string) => Promise<void>;
  completeExchange: (id: string) => Promise<void>;
  retryExchangeShipment: (id: string) => Promise<void>;
};

export const useExchangeStore = create<ExchangeStore>((set) => ({
  exchangeRequests: [],
  loading: false,
  error: null,
  pageNo: 1,
  totalPages: 1,
  actionLoadingId: null,

  fetchExchangeRequests: async (opts = {}) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/admin/exchange", {
        headers: authHeaders(),
        params: {
          status: opts.status && opts.status !== "ALL" ? opts.status : undefined,
          orderId: opts.orderId,
          page: opts.page || 1,
        },
      });

      set({
        exchangeRequests: res.data.exchangeRequests,
        pageNo: res.data.pageNo,
        totalPages: res.data.totalPages,
        loading: false,
      });
    } catch (err) {
      set({
        loading: false,
        error: extractErrorMessage(err, "Unable to load exchange requests"),
      });
    }
  },

  approveExchange: async (id) => {
    set({ actionLoadingId: id });
    try {
      const res = await api.post(
        `/admin/exchange/${id}/approve`,
        {},
        { headers: authHeaders() },
      );
      set((state) => ({
        actionLoadingId: null,
        exchangeRequests: state.exchangeRequests.map((r) =>
          r.id === id ? { ...r, ...res.data.exchangeRequest } : r,
        ),
      }));
    } catch (err) {
      set({ actionLoadingId: null });
      throw new Error(extractErrorMessage(err, "Unable to approve exchange"));
    }
  },

  rejectExchange: async (id, adminNote) => {
    set({ actionLoadingId: id });
    try {
      const res = await api.post(
        `/admin/exchange/${id}/reject`,
        { adminNote },
        { headers: authHeaders() },
      );
      set((state) => ({
        actionLoadingId: null,
        exchangeRequests: state.exchangeRequests.map((r) =>
          r.id === id ? { ...r, ...res.data.exchangeRequest } : r,
        ),
      }));
    } catch (err) {
      set({ actionLoadingId: null });
      throw new Error(extractErrorMessage(err, "Unable to cancel exchange"));
    }
  },

  completeExchange: async (id) => {
    set({ actionLoadingId: id });
    try {
      const res = await api.post(
        `/admin/exchange/${id}/complete`,
        {},
        { headers: authHeaders() },
      );
      set((state) => ({
        actionLoadingId: null,
        exchangeRequests: state.exchangeRequests.map((r) =>
          r.id === id ? { ...r, ...res.data.exchangeRequest } : r,
        ),
      }));
    } catch (err) {
      set({ actionLoadingId: null });
      throw new Error(extractErrorMessage(err, "Unable to mark exchange complete"));
    }
  },

  retryExchangeShipment: async (id) => {
    set({ actionLoadingId: id });
    try {
      const res = await api.post(
        `/admin/exchange/${id}/retry-shipment`,
        {},
        { headers: authHeaders() },
      );
      set((state) => ({
        actionLoadingId: null,
        exchangeRequests: state.exchangeRequests.map((r) =>
          r.id === id ? { ...r, ...res.data.exchangeRequest } : r,
        ),
      }));
    } catch (err) {
      set({ actionLoadingId: null });
      throw new Error(extractErrorMessage(err, "Unable to retry shipment"));
    }
  },
}));

