import { create } from "zustand";
import { api } from "../services/api";

export type Order = {
  id: string;
  orderNumber: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod?: string | null;
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
    } | null;
    id: string;
    name: string;
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
    awbNumber?: string | null;
    status?: string | null;
    trackingNumber?: string | null;
    trackingUrl?: string | null;
  }[];
};

export type ShipmentScan = {
  status: string | null;
  instructions: string | null;
  location: string | null;
  dateTime: string | null;
};

export type ShipmentTracking = {
  awbNumber: string;
  currentStatus: string | null;
  statusType: string | null;
  statusDateTime: string | null;
  statusLocation: string | null;
  destination: string | null;
  scans: ShipmentScan[];
};

type OrderStore = {
  orders: Order[];
  selectedOrder: OrderDetails | null;

  loading: boolean;

  pageNo: number;
  totalPages: number;

  shipmentTracking: ShipmentTracking | null;
  trackingLoading: boolean;
  trackingError: string | null;
  cancellingShipment: boolean;

  fetchOrders: (page?: number) => Promise<void>;

  getOrderDetails: (id: string) => Promise<void>;

  updateOrderStatus: (id: string, orderStatus: string) => Promise<void>;
  updateShipment: (id: string, orderStatus: string) => Promise<void>;
  createShipment: (orderId: string) => Promise<void>;
  getShipmentTracking: (orderId: string) => Promise<void>;
  cancelShipment: (orderId: string) => Promise<void>;
  clearShipmentTracking: () => void;
};

function extractErrorMessage(err: unknown, fallback: string): string {
  const maybeAxiosError = err as {
    response?: { data?: { message?: string } };
  };
  return maybeAxiosError?.response?.data?.message || fallback;
}

export const useOrderStore = create<OrderStore>((set) => ({
  orders: [],
  selectedOrder: null,

  loading: false,

  pageNo: 1,
  totalPages: 1,

  shipmentTracking: null,
  trackingLoading: false,
  trackingError: null,
  cancellingShipment: false,

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
      selectedOrder:
        state.selectedOrder && state.selectedOrder.id === id
          ? { ...state.selectedOrder, orderStatus }
          : state.selectedOrder,
    }));
  },

  updateShipment: async (id, data) => {
    await api.put(`/admin/order/updateShipment/${id}`, data);
  },

  createShipment: async (orderId) => {
    await api.post(`/admin/shipment/create/${orderId}`);
  },

  getShipmentTracking: async (orderId) => {
    set({ trackingLoading: true, trackingError: null });

    try {
      const res = await api.get(`/admin/shipment/track/${orderId}`);
      set({ shipmentTracking: res.data, trackingLoading: false });
    } catch (err) {
      set({
        trackingLoading: false,
        trackingError: extractErrorMessage(
          err,
          "Unable to fetch live tracking from Delhivery",
        ),
      });
    }
  },

  cancelShipment: async (orderId) => {
    set({ cancellingShipment: true });

    try {
      await api.post(`/admin/shipment/cancel/${orderId}`);

      set((state) => ({
        cancellingShipment: false,
        selectedOrder: state.selectedOrder
          ? {
              ...state.selectedOrder,
              orderStatus: "CANCELLED",
              shipments: state.selectedOrder.shipments.map((s) => ({
                ...s,
                status: "CANCELLED",
              })),
            }
          : state.selectedOrder,
        orders: state.orders.map((o) =>
          o.id === orderId ? { ...o, orderStatus: "CANCELLED" } : o,
        ),
      }));
    } catch (err) {
      set({ cancellingShipment: false });
      throw new Error(
        extractErrorMessage(err, "Unable to cancel the shipment"),
      );
    }
  },

  clearShipmentTracking: () => set({ shipmentTracking: null, trackingError: null }),
}));
