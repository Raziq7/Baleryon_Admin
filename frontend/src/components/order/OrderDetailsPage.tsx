import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useOrderStore } from "../../store/orderStore";
import Button from "../../components/ui/button/Button";

export default function OrderDetailsPage() {
  const { orderId } = useParams();

  const { selectedOrder, getOrderDetails, updateOrderStatus,createShipment } = useOrderStore();

  const [status, setStatus] = useState("");
const [loadingShipment, setLoadingShipment] = useState(false);
  useEffect(() => {
    if (orderId) getOrderDetails(orderId);
  }, [orderId]);

  useEffect(() => {
    if (selectedOrder) {
      setStatus(selectedOrder.orderStatus);
    }
  }, [selectedOrder]);

  console.log(
    selectedOrder,
    "selectedOrderselectedOrderselectedOrderselectedOrder",
  );

  if (!selectedOrder) {
    return (
      <div className="p-6 text-sm text-gray-500">Loading order details...</div>
    );
  }

  const statusColor = (value: string) => {
    switch (value) {
      case "DELIVERED":
        return "bg-green-100 text-green-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      case "SHIPPED":
        return "bg-blue-100 text-blue-700";
      case "PROCESSING":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER CARD */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Order #{selectedOrder.orderNumber}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {selectedOrder.user.fullName} • {selectedOrder.user.email}
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="text-xl font-bold text-gray-800 dark:text-white">
              ₹{selectedOrder.totalAmount}
            </p>
          </div>
        </div>

        {/* STATUS BADGE */}
        <div className="mt-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(
              selectedOrder.orderStatus,
            )}`}
          >
            {selectedOrder.orderStatus}
          </span>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT - ORDER STATUS */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">
            Update Order Status
          </h3>

          <label className="text-sm text-gray-500 mb-2 block">
            Order Status
          </label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm
                       dark:border-gray-700 dark:bg-gray-900 dark:text-white
                       focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <Button
            className="mt-4 w-full"
            onClick={() => updateOrderStatus(selectedOrder.id, status)}
          >
            Update Status
          </Button>
        </div>

        {/* RIGHT - ORDER INFO */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">
            Order Info
          </h3>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Order Date</span>
              <span className="text-gray-800 dark:text-white">
                {new Date(selectedOrder.placedAt).toLocaleDateString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Payment Status</span>
              <span className="text-gray-800 dark:text-white">
                {selectedOrder.paymentStatus}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Items</span>
              <span className="text-gray-800 dark:text-white">
                {selectedOrder.items?.length || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SHIPMENT CARD */}
      {/* <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">
          Shipment Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500">Courier Name</label>
            <input
              className="w-full mt-1 rounded-lg border px-3 py-2 text-sm
                         dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              placeholder="e.g. Delhivery"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Tracking Number</label>
            <input
              className="w-full mt-1 rounded-lg border px-3 py-2 text-sm
                         dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              placeholder="Tracking ID"
            />
          </div>
        </div>

        <Button className="mt-4 w-full">Update Shipment</Button>
      </div> */}

      {/* SHIPMENT CARD */}
<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
  <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">
    Shipment Details
  </h3>

  {/* If shipment already exists */}
  {selectedOrder.shipments?.length > 0 ? (
    <div className="space-y-3">
      <div className="p-4 rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          🚚 Shipment already created
        </p>

        <p className="mt-2 text-sm">
          <span className="font-medium">AWB:</span>{" "}
          {selectedOrder?.awbNumber || "N/A"}
        </p>

        <p className="text-sm">
          <span className="font-medium">Status:</span>{" "}
         {selectedOrder.orderStatus}
        </p>

        {selectedOrder.shipments[0]?.trackingUrl && (
          <a
            href={selectedOrder.shipments[0].trackingUrl}
            target="_blank"
            className="text-blue-600 text-sm underline"
          >
            Track Shipment
          </a>
        )}
      </div>
    </div>
  ) : (
    <>
      {/* Create Shipment Options */}
      <div className="space-y-4">

        {/* Courier Selection */}
        <div>
          <label className="text-sm text-gray-500">Courier</label>
          <select
            className="w-full mt-1 rounded-lg border px-3 py-2 text-sm
                       dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <option value="DELHIVERY">Delhivery</option>
          </select>
        </div>

        {/* Shipment Type */}
        <div>
          <label className="text-sm text-gray-500">Shipment Type</label>
          <select
            className="w-full mt-1 rounded-lg border px-3 py-2 text-sm
                       dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <option value="NATIONAL_COURIER">National Courier</option>
            <option value="LOCAL_DELIVERY">Local Delivery</option>
            <option value="BUSINESS_SHIPMENT">Business Shipment</option>
          </select>
        </div>

        {/* Pickup Mode */}
        <div>
          <label className="text-sm text-gray-500">Pickup Mode</label>
          <select
            className="w-full mt-1 rounded-lg border px-3 py-2 text-sm
                       dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <option value="SCHEDULED_PICKUP">Scheduled Pickup</option>
            <option value="ON_DEMAND">On Demand Pickup</option>
          </select>
        </div>
      </div>

      {/* CREATE BUTTON */}
      <Button
        className="mt-4 w-full"
        disabled={loadingShipment}
        onClick={async () => {
          setLoadingShipment(true);
          try {
            await createShipment(selectedOrder.id);
            await getOrderDetails(orderId!); // refresh UI
          } finally {
            setLoadingShipment(false);
          }
        }}
      >
        {loadingShipment ? "Creating Shipment..." : "Create Shipment (Generate AWB)"}
      </Button>
    </>
  )}
</div>

      {/* ITEMS CARD */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">
          Ordered Items
        </h3>

        <div className="space-y-3">
          {selectedOrder.items?.map((item) => {
            if (!item.product) {
              return (
                <div
                  key={item.id}
                  className="rounded-lg border border-red-200 p-4"
                >
                  Product no longer exists
                </div>
              );
            }

            const image =
              item.product.images[0]?.url || "/placeholder-product.png";

            return (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800"
              >
                <img
                  src={image}
                  alt={item.product.title}
                  className="h-20 w-20 rounded-lg object-cover"
                />

                <div className="flex-1">
                  <h4 className="font-medium">{item.product.category.name}</h4>

                  <p>Qty: {item.quantity}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
