import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useOrderStore } from "../../store/orderStore";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Button from "../ui/button/Button";
import PaginationControls from "../ui/pagination/PaginationControls";

export default function OrderTable() {
  const navigate = useNavigate();

  const {
    orders,
    fetchOrders,
    pageNo,
    totalPages,
    loading,
    // error,
  } = useOrderStore();

  useEffect(() => {
    fetchOrders(pageNo);
  }, [fetchOrders, pageNo]);

  const getStatusColor = (status: string) => {
  switch (status) {
    case "DELIVERED":
      return "bg-green-50 text-green-700 border border-green-200";

    case "CANCELLED":
      return "bg-red-50 text-red-700 border border-red-200";

    case "SHIPPED":
      return "bg-blue-50 text-blue-700 border border-blue-200";

    case "PENDING":
      return "bg-amber-50 text-amber-700 border border-amber-200";

    default:
      return "bg-gray-50 text-gray-700 border border-gray-200";
  }
};

const getPaymentColor = (status: string) => {
  switch (status) {
    case "SUCCESS":
      return "bg-green-50 text-green-700 border border-green-200";

    case "FAILED":
      return "bg-red-50 text-red-700 border border-red-200";

    default:
      return "bg-yellow-50 text-yellow-700 border border-yellow-200";
  }
};

  return (
  <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg shadow-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
    {/* Header */}
    <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 dark:border-gray-800">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Order Management
        </h2>
        <p className="text-sm text-gray-500">
          Manage customer orders and track fulfillment
        </p>
      </div>

      <div className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium dark:bg-gray-800 dark:text-gray-300">
        Total Orders: {orders.length}
      </div>
    </div>

    {/* Loading */}
    {loading && (
      <div className="p-8 text-center">
        <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500"></div>
        <p className="text-gray-500">Loading orders...</p>
      </div>
    )}

    <div className="max-w-full overflow-x-auto">
      <Table>
        <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
          <TableRow>
            <TableCell isHeader>Order</TableCell>
            <TableCell isHeader>Customer</TableCell>
            <TableCell isHeader>Total</TableCell>
            <TableCell isHeader>Payment</TableCell>
            <TableCell isHeader>Status</TableCell>
            <TableCell isHeader>Date</TableCell>
            <TableCell isHeader>Actions</TableCell>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
          {!loading && orders.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="px-4 py-12 text-center"
              >
                <div className="flex flex-col items-center">
                  <div className="mb-3 text-5xl">📦</div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    No Orders Found
                  </h3>
                  <p className="text-sm text-gray-500">
                    Orders will appear here once customers place them.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}

          {orders.map((order) => (
            <TableRow
              key={order.id}
              className="transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/30"
            >
              {/* Order */}
              <TableCell className="px-5 py-4">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    #{order.orderNumber}
                  </p>
                  <p className="text-xs text-gray-500">
                    ID: {order.id.slice(0, 8)}
                  </p>
                </div>
              </TableCell>

              {/* Customer */}
              <TableCell className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600">
                    {order.user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                  </div>

                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {order.user.fullName}
                    </p>
                    <p className="text-xs text-gray-500">
                      Customer
                    </p>
                  </div>
                </div>
              </TableCell>

              {/* Total */}
              <TableCell className="px-5 py-4">
                <span className="text-lg font-bold text-green-600">
                  ₹{Number(order.totalAmount).toLocaleString()}
                </span>
              </TableCell>

              {/* Payment */}
              <TableCell className="px-5 py-4">
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${getPaymentColor(
                    order.paymentStatus
                  )}`}
                >
                  <span className="h-2 w-2 rounded-full bg-current"></span>
                  {order.paymentStatus}
                </span>
              </TableCell>

              {/* Status */}
              <TableCell className="px-5 py-4">
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                    order.orderStatus
                  )}`}
                >
                  <span className="h-2 w-2 rounded-full bg-current"></span>
                  {order.orderStatus}
                </span>
              </TableCell>

              {/* Date */}
              <TableCell className="px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(order.placedAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.placedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </TableCell>

              {/* Actions */}
              <TableCell className="px-5 py-4">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      navigate(`/order-management/${order.id}`)
                    }
                  >
                    View
                  </Button>

                  <Button
                    size="sm"
                    onClick={() =>
                      navigate(`/order-management/${order.id}`)
                    }
                  >
                    Manage
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

    {/* Pagination */}
    <div className="border-t border-gray-100 p-4 dark:border-gray-800">
      <PaginationControls
        currentPage={pageNo}
        totalPages={totalPages}
        onPageChange={(page) => fetchOrders(page)}
      />
    </div>
  </div>
);
}