import { create } from "zustand";
import { api } from "../services/api";

/* ---------------- TYPES ---------------- */

export type CouponType = "PERCENTAGE" | "FIXED";

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;              
  minimumOrder?: number | null; 
  usageLimit?: number | null;
  usedCount: number;
  startsAt?: string | null;
  expiresAt?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ValidateCouponResponse {
  valid: boolean;
  discount: number;
  finalAmount: number;
  couponId: string;
}

/* ---------------- STORE ---------------- */

interface CouponStore {
  coupons: Coupon[];
  loading: boolean;

  fetchCoupons: () => Promise<void>;

  createCoupon: (data: {
    code: string;
    type: CouponType;
    value: number;
    minimumOrder?: number;
    usageLimit?: number;
    startsAt?: string;
    expiresAt?: string;
    isActive?: boolean;
  }) => Promise<void>;

  updateCoupon: (
    id: string,
    data: Partial<Omit<Coupon, "id" | "createdAt" | "updatedAt">>
  ) => Promise<void>;

  deleteCoupon: (id: string) => Promise<void>;

  validateCoupon: (
    code: string,
    orderAmount: number
  ) => Promise<ValidateCouponResponse>;
}

/* ---------------- IMPLEMENTATION ---------------- */

export const useCouponStore = create<CouponStore>((set, get) => ({
  coupons: [],
  loading: false,

  fetchCoupons: async () => {
    set({ loading: true });

    const res = await api.get<Coupon[]>("/admin/coupons");

    set({
      coupons: res.data,
      loading: false,
    });
  },

  createCoupon: async (data) => {
    await api.post("/admin/coupons", data);
    await get().fetchCoupons();
  },

  updateCoupon: async (id, data) => {
    await api.put(`/admin/coupons/${id}`, data);
    await get().fetchCoupons();
  },

  deleteCoupon: async (id) => {
    await api.delete(`/admin/coupons/${id}`);
    await get().fetchCoupons();
  },

  validateCoupon: async (code, orderAmount) => {
    const res = await api.post<ValidateCouponResponse>(
      "/coupons/validate",
      {
        code,
        orderAmount,
      }
    );

    return res.data;
  },
}));