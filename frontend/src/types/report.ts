export type RangeType =
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly";

export interface ReportSummary {
  totalOrders: number;
  totalRevenue: number;
  totalItems: number;
  totalPayments: number;
  avgOrderValue: number;
}

export interface PaymentSummary {
  method: string;
  count: number;
  amount: number;
}

export interface TopProduct {
  productName: string;
  soldQty: number;
  revenue: number;
}

export interface LowStockProduct {
  name: string;
  stock: number;
}

export interface RecentOrder {
  id:string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
}

export interface ReportResponse {
  start: string;
  end: string;

  summary: {
    totalOrders: number;
    totalRevenue: number;
    totalItemsSold: number;
    avgOrderValue: number;
  };

  paymentSummary: PaymentSummary[];

  topProducts: TopProduct[];

  lowStockProducts: {
    id: string;
    sku: string;
    productName: string;
    name: string;
    size: string;
    color: string;
    stock: number;
  }[];

  recentOrders: RecentOrder[];
}