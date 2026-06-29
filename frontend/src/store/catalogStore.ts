import { create } from "zustand";
import axios from "axios";
import { api } from "../services/api";

export type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  parentId?: string | null;
  productCount?: number;
  createdAt: string;
};

export type Brand = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  productCount?: number;
  createdAt: string;
};

type CatalogState = {
  categories: Category[];
  brands: Brand[];
  selectedCategory: Category | null;
  selectedBrand: Brand | null;
  loading: boolean;
  error: string | null;

  fetchCategories: () => Promise<void>;
  getCategoryById: (id: string) => Promise<void>;
  addCategory: (data: FormData) => Promise<void>;
  updateCategory: (id: string, data: FormData) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  fetchBrands: () => Promise<void>;
  getBrandById: (id: string) => Promise<void>;
  addBrand: (data: FormData) => Promise<void>;
  updateBrand: (id: string, data: FormData) => Promise<void>;
  deleteBrand: (id: string) => Promise<void>;
};

function handleError(
  err: unknown,
  set: (partial: Partial<CatalogState>) => void
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

export const useCatalogStore = create<CatalogState>((set) => ({
  categories: [],
  brands: [],
  selectedCategory: null,
  selectedBrand: null,
  loading: false,
  error: null,

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<{ categories: Category[] }>(
        "/admin/catalog/categories"
      );
      set({ categories: res.data.categories || [], loading: false });
    } catch (err) {
      handleError(err, set);
    }
  },

  getCategoryById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<{ category: Category }>(
        `/admin/catalog/categories/${id}`
      );
      set({ selectedCategory: res.data.category, loading: false });
    } catch (err) {
      handleError(err, set);
    }
  },

  addCategory: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.post("/admin/catalog/categories", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await useCatalogStore.getState().fetchCategories();
      set({ loading: false });
    } catch (err) {
      handleError(err, set);
      throw err;
    }
  },

  updateCategory: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await api.put(`/admin/catalog/categories/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await useCatalogStore.getState().fetchCategories();
      set({ loading: false });
    } catch (err) {
      handleError(err, set);
      throw err;
    }
  },

  deleteCategory: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/admin/catalog/categories/${id}`);
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
        loading: false,
      }));
    } catch (err) {
      handleError(err, set);
      throw err;
    }
  },

  fetchBrands: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<{ brands: Brand[] }>("/admin/catalog/brands");
      set({ brands: res.data.brands || [], loading: false });
    } catch (err) {
      handleError(err, set);
    }
  },

  getBrandById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<{ brand: Brand }>(
        `/admin/catalog/brands/${id}`
      );
      set({ selectedBrand: res.data.brand, loading: false });
    } catch (err) {
      handleError(err, set);
    }
  },

  addBrand: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.post("/admin/catalog/brands", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await useCatalogStore.getState().fetchBrands();
      set({ loading: false });
    } catch (err) {
      handleError(err, set);
      throw err;
    }
  },

  updateBrand: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await api.put(`/admin/catalog/brands/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await useCatalogStore.getState().fetchBrands();
      set({ loading: false });
    } catch (err) {
      handleError(err, set);
      throw err;
    }
  },

  deleteBrand: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/admin/catalog/brands/${id}`);
      set((state) => ({
        brands: state.brands.filter((b) => b.id !== id),
        loading: false,
      }));
    } catch (err) {
      handleError(err, set);
      throw err;
    }
  },
}));
