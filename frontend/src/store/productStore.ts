import { create } from "zustand";
import axios from "axios";
import { api } from "../services/api";
import type { ProductReview } from "../components/users/userDetails/types";

export type ProductSize = {
  size: string;
  quantity: number;
};

export type ProductCategory = {
  name: string;
  id?: string;
};

export type ProductBrand = {
  name: string;
  id?: string;
};

export type ProductColor = {
  name: string;
  hex?: string | null;
};

export type ProductImageRecord = {
  id: string;
  url: string;
  isPrimary?: boolean;
};

export type Product = {
  _id: string;
  productName: string;
  description: string;
  price: number;
  discount?: number;
  category: ProductCategory | string;
  brand?: ProductBrand | null;
  note?: string;
  sizes: ProductSize[];
  color?: string;
  colors?: ProductColor[];
  productDetails?: string;
  isReturn?: boolean;
  reviews?: ProductReview[];
  image: string[] | Record<string, unknown>;
  productImages?: ProductImageRecord[];
  createdAt?: string;
  updatedAt?: string;
};

type ProductsResponse = {
  products: Product[];
  pageNo: number;
  totalPages: number;
  totalProducts: number;
};

export type ProductMini = {
  id: string;
  name: string;
  description?: string;
  price: number;
  discount?: number;
  isReturn?: boolean;
  category?: {
    id: string;
    name: string;
  } | null;
  images?: {
    id: string;
    url: string;
  }[];
};

export type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  product: ProductMini | null;
  variant?: {
    id: string;
    size?: string;
    color?: string;
  } | null;
};

type ProductState = {
  products: Product[];
  selectedProduct: Product | null;
  pageNo: number;
  totalPages: number;
  totalProducts: number;
  loading: boolean;
  error: string | null;
  addSuccess: boolean;
  updateSuccess: boolean;
  fetchProducts: (page?: number, limit?: number) => Promise<void>;
  getProductById: (id: string) => Promise<void>;
  addProduct: (formData: FormData) => Promise<void>;
  updateProduct: (id: string, formData: FormData) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  resetAddSuccess: () => void;
  resetUpdateSuccess: () => void;
  clearSelectedProduct: () => void;
};

function handleError(
  err: unknown,
  set: (partial: Partial<ProductState>) => void
) {
  if (axios.isAxiosError(err)) {
    const message = err.response?.data?.message || "Request failed";
    set({ error: message, loading: false });
  } else {
    set({ error: "An unexpected error occurred", loading: false });
  }
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  selectedProduct: null,
  pageNo: 1,
  totalPages: 1,
  totalProducts: 0,
  loading: false,
  error: null,
  addSuccess: false,
  updateSuccess: false,

  fetchProducts: async (page = 1, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<ProductsResponse>("/admin/product/getProducts", {
        params: { page, limit },
      });

      set({
        products: res.data.products || [],
        pageNo: res.data.pageNo || page,
        totalPages: res.data.totalPages || 1,
        totalProducts: res.data.totalProducts || 0,
        loading: false,
      });
    } catch (err) {
      handleError(err, set);
    }
  },

  getProductById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<{ product: Product }>(
        "/admin/product/productDetails",
        { params: { id } }
      );
      set({ selectedProduct: res.data.product, loading: false });
    } catch (err) {
      handleError(err, set);
      throw err;
    }
  },

  addProduct: async (formData) => {
    set({ loading: true, error: null, addSuccess: false });
    try {
      await api.post("/admin/product/addProduct", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set({ loading: false, addSuccess: true });
    } catch (err) {
      handleError(err, set);
      throw err;
    }
  },

  updateProduct: async (id, formData) => {
    set({ loading: true, error: null, updateSuccess: false });
    try {
      await api.put(`/admin/product/updateProduct/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set({ loading: false, updateSuccess: true });
    } catch (err) {
      handleError(err, set);
      throw err;
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/admin/product/deleteProduct/${id}`);
      set((state) => ({
        products: state.products.filter((p) => p._id !== id),
        loading: false,
      }));
    } catch (err) {
      handleError(err, set);
      throw err;
    }
  },

  resetAddSuccess: () => set({ addSuccess: false }),
  resetUpdateSuccess: () => set({ updateSuccess: false }),
  clearSelectedProduct: () => set({ selectedProduct: null }),
}));

export function getCategoryName(category: Product["category"]): string {
  if (!category) return "";
  if (typeof category === "string") return category;
  return category.name || "";
}

export function getBrandName(brand: Product["brand"]): string {
  if (!brand) return "";
  return brand.name || "";
}

export function getProductImages(product: Product): ProductImageRecord[] {
  if (product.productImages?.length) {
    return product.productImages;
  }
  const urls = Array.isArray(product.image) ? product.image : [];
  return urls
    .filter((u): u is string => typeof u === "string" && !!u)
    .map((url, index) => ({
      id: `legacy-${index}`,
      url,
    }));
}

export function getProductImageUrl(product: Product): string {
  const images = getProductImages(product);
  return images[0]?.url || "";
}
