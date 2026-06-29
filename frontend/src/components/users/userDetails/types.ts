// export interface UserDetails {
//   id: string;
//   fullName: string;
//   email: string;
//   phone: string;
//   image?: string | null;
//   role: string;
//   isBlocked: boolean;
//   isVerified: boolean;
//   provider: string;
//   createdAt: string;
//   lastLogin?: string;
// }



export interface UserDetails {
  id: string;
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string | null;
  profileImage: string | null;
  provider: string;
  isVerified: boolean;
  isBlocked: boolean;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  role: string | null;
  orderCount: number;
}

export interface UserStats {
  totalOrders: number;
  totalSpent: number;
  pendingOrders: number;
  totalReviews: number;
}


export interface Order {
  id: string;
  orderNumber: string;
  orderStatus:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "CANCELLED"
    | "RETURNED";
  paymentStatus: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  paymentMethod: string | null;
  totalAmount: string | null;
  subtotal: string | null;
  shippingAmount: string | null;
  discountAmount: string | null;
  placedAt: string;
  items: OrderItem[];
}

export interface Payment {
  id: string;
  orderId: string;
  orderNumber: string;
  paymentGateway: string | null;
  transactionId: string | null;
  paymentStatus: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  amount: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string | null;
  phone: string | null;
  addressLine1: string;
  addressLine2: string | null;
  landmark: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  isDefault: boolean;
  createdAt: string;
}

export interface ProductImage {
  imageUrl: string;
  isPrimary: boolean;
  altText: string | null;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  basePrice: string;
  salePrice: string | null;
  isActive: boolean;
  isFeatured: boolean;
  category: { id: string; name: string } | null;
  brand: { id: string; name: string } | null;
  images: ProductImage[];
  createdAt: string;
}

export interface Activity {
  id: string;
  eventName:
    | "PRODUCT_VIEW"
    | "ADD_TO_CART"
    | "REMOVE_CART"
    | "CHECKOUT_STARTED"
    | "PAYMENT_SUCCESS"
    | "PAYMENT_FAILED";
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface Tracking {
  id: string;
  orderId: string;
  orderNumber: string;
  courierName: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
}

// API response shape
export interface UserDetailsResponse {
  success: boolean;
  user: UserDetails;
  stats: UserStats;
  orders: Order[];
  payments: Payment[];
  addresses: Address[];
  products: Product[];
  activities: Activity[];
  tracking: Tracking[];
}
export interface UserStats {
  totalOrders: number;
  totalSpent: number;
  pendingOrders: number;
  totalReviews: number;
}

// types.ts

// export interface UserDetails {
//   id: string;
//   fullName: string;
//   email: string;
//   phone: string ;
//   profileImage: string | null;
//   provider: string;
//   isVerified: boolean;
//   isBlocked: boolean;
//   lastLogin?: string;
//   createdAt: string;
//   role: string;
// }

export interface UserStats {
  totalOrders: number;
  totalSpent: number;
  pendingOrders: number;
  totalReviews: number;
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number | null;

  product: {
    id: string;
    title: string;

    images: {
      id: string;
      imageUrl: string;
    }[];
  };

  variant: {
    id: string;
    size: string;
  } | null;
}


export interface OrderDetails {
  id: string;
  orderNumber: string;

  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;

  subtotal: number;
  shippingAmount: number;
  totalAmount: number;

  placedAt: string;

  user: {
    fullName: string;
    email: string;
    phone: string;
  };

  address: {
    fullName: string;
    phone: string;

    addressLine1: string;
    addressLine2: string | null;

    city: string;
    state: string;
    country: string;
    postalCode: string;
  };

  items: OrderItem[];

}


export interface Order {
  id: string;
  orderNumber: string;
  orderStatus:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "CANCELLED"
    | "RETURNED";
  paymentStatus: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  paymentMethod: string | null;
  totalAmount: string | null;
  subtotal: string | null;
  shippingAmount: string | null;
  discountAmount: string | null;
  placedAt: string;
  items: OrderItem[];
}

export interface Payment {
  id: string;
  orderId: string;
  orderNumber: string;
  paymentGateway: string | null;
  transactionId: string | null;
  paymentStatus: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  amount: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface Address {
  id: string;
  fullName: string | null;
  phone: string | null;
  addressLine1: string;
  addressLine2: string | null;
  landmark: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  isDefault: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  basePrice: string;
  salePrice: string | null;
  isActive: boolean;
  isFeatured: boolean;
  category: { id: string; name: string } | null;
  brand: { id: string; name: string } | null;
  images: ProductImage[]; // ← was { imageUrl: string; isPrimary: boolean }[]
  reviews?: ProductReview[];
  createdAt: string;
}

export interface Activity {
  id: string;
  eventName:
    | "PRODUCT_VIEW"
    | "ADD_TO_CART"
    | "REMOVE_CART"
    | "CHECKOUT_STARTED"
    | "PAYMENT_SUCCESS"
    | "PAYMENT_FAILED";
  metadata: Record<string, unknown> | null;
  createdAt: string;
}


export type ProductReview = {
  id: string;
  rating: number;
  review?: string;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email?: string;
    profileImage?: string;
    createdAt?: string;
    _count?: {
      orders: number;
    };
  };
};