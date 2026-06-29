import { create } from "zustand";
import { api } from "../services/api";

export interface InventoryVariant {
  id: string;
  sku: string;
  stock: number;
  size?: string;
  color?: string;
  product: {
    title: string;
  };
}

export interface InventoryLog {
  id: string;
  quantity: number;
  type: string;
  note?: string;
  createdAt: string;
  variant: {
    sku: string;
    product: {
      title: string;
    };
  };
}

interface InventoryStore {
  items: InventoryVariant[];
  logs: InventoryLog[];
  loading: boolean;

  fetchInventory: () => Promise<void>;
  fetchLogs: () => Promise<void>;

  adjustStock: (
    variantId: string,
    payload: {
      quantity: number;
      type: string;
      note?: string;
    }
  ) => Promise<void>;
}

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  items: [],
  logs: [],
  loading: false,

  fetchInventory: async () => {
    set({ loading: true });

    const res = await api.get("/admin/inventory");

    set({ items: res.data, loading: false });
  },

  fetchLogs: async () => {
    const res = await api.get("/admin/inventory/logs");

    set({ logs: res.data });
  },

  adjustStock: async (variantId, payload) => {
    await api.post(`/admin/inventory/${variantId}/adjust`, payload);

    await get().fetchInventory();
    await get().fetchLogs();
  },
}));