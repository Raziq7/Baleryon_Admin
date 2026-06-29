import type { Order } from "./types";

interface Props {
  orders: Order[];
}

const orderStatusStyles: Record<Order["orderStatus"], string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  OUT_FOR_DELIVERY: "bg-cyan-100 text-cyan-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  RETURNED: "bg-gray-100 text-gray-700",
};

const paymentStatusStyles: Record<Order["paymentStatus"], string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  SUCCESS: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-blue-100 text-blue-700",
};

export default function UserOrdersTab({ orders }: Props) {
  if (!orders.length) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center text-gray-400">
        No orders found.
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">Order</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Items</th>
            <th className="px-4 py-3 font-medium">Payment</th>
            <th className="px-4 py-3 font-medium">Order Status</th>
            <th className="px-4 py-3 font-medium">Total</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-xs text-gray-600">
                {order.orderNumber}
              </td>

              <td className="px-4 py-3 text-gray-500">
                {new Date(order.placedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </td>

              <td className="px-4 py-3 text-gray-700">
                {order.items.length}{" "}
                {order.items.length === 1 ? "item" : "items"}
              </td>

              <td className="px-4 py-3">
                <div className="flex flex-col gap-1">
                  <span
                    className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${paymentStatusStyles[order.paymentStatus]}`}
                  >
                    {order.paymentStatus}
                  </span>
                  {order.paymentMethod && (
                    <span className="text-xs capitalize text-gray-400">
                      via {order.paymentMethod}
                    </span>
                  )}
                </div>
              </td>

              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${orderStatusStyles[order.orderStatus]}`}
                >
                  {order.orderStatus.replace(/_/g, " ")}
                </span>
              </td>

              <td className="px-4 py-3 font-semibold text-gray-800">
                ₹{order.totalAmount ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}