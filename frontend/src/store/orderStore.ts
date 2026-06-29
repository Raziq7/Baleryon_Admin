import { create } from "zustand";
import { api } from "../services/api";

export type Order = {
  id: string;
  orderNumber: string;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  placedAt: string;

  user: {
    fullName: string;
    email: string;
  };
};

export type OrderItem = {
  id: string;
  productName: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  price: number;
  image: string | null;

  product?: {
    category: {
      id: string;
      name: string;
    };
    id: string;
    title: string;
    images: {
      url: string;
    }[];
  } | null;

  variant?: {
    id: string;
    color: string | null;
    size: string | null;
  } | null;
};

export type OrderDetails = {
  id: string;
  orderNumber: string;

  subtotal: number | null;
  discountAmount: number | null;
  shippingAmount: number | null;
  totalAmount: number | null;

  paymentStatus: string;
  orderStatus: string;
  paymentMethod: string | null;
  awbNumber:string | null;

  image: string | null;

  placedAt: string;

  user: {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
  };

  address?: {
    fullName?: string | null;
    phone?: string | null;
    addressLine1: string;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: string | null;
  } | null;

  items: OrderItem[];

  payments: {
    id: string;
    transactionId?: string | null;
    paymentStatus: string;
    amount?: number | null;
  }[];

  shipments: {
    id: string;
    courierName?: string | null;
    trackingNumber?: string | null;
    trackingUrl?: string | null;
  }[];
};

type OrderStore = {
  orders: Order[];
  selectedOrder: OrderDetails | null;

  loading: boolean;

  pageNo: number;
  totalPages: number;

  fetchOrders: (page?: number) => Promise<void>;

  getOrderDetails: (id: string) => Promise<void>;

  updateOrderStatus: (id: string, orderStatus: string) => Promise<void>;
  updateShipment: (id: string, orderStatus: string) => Promise<void>;
  createShipment: (orderId: string) => Promise<void>;
};

export const useOrderStore = create<OrderStore>((set) => ({
  orders: [],
  selectedOrder: null,

  loading: false,

  pageNo: 1,
  totalPages: 1,

  fetchOrders: async (page = 1) => {
    set({ loading: true });

    const res = await api.get("/admin/order/getOrders", {
      params: { page },
    });

    set({
      orders: res.data.orders,
      pageNo: res.data.pageNo,
      totalPages: res.data.totalPages,
      loading: false,
    });
  },

  getOrderDetails: async (id) => {
    set({ loading: true });

    const res = await api.get(`/admin/order/orderDetails/${id}`);

    set({
      selectedOrder: res.data,
      loading: false,
    });
  },

  updateOrderStatus: async (id, orderStatus) => {
    await api.put(`/admin/order/updateStatus/${id}`, { orderStatus });

    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id ? { ...o, orderStatus } : o,
      ),
    }));
  },

  updateShipment: async (id, data) => {
    await api.put(`/admin/order/updateShipment/${id}`, data);
  },

  createShipment: async (orderId) => {
  await api.post(`/admin/shipment/create/${orderId}`);
},
}));
