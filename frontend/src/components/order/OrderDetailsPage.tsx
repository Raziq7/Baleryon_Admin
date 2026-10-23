import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useOrderStore } from "../../store/orderStore";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import Loader, { InlineLoader } from "../../components/common/Loader";
import { useExchangeStore } from "../../store/exchangeStore";
import { Link } from "react-router-dom";

type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";

const CANCELLABLE_ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
];

function statusBadgeColor(value?: string | null): BadgeColor {
  switch (value) {
    case "DELIVERED":
    case "COMPLETED":
      return "success";
    case "CANCELLED":
    case "REJECTED":
      return "error";
    case "SHIPPED":
    case "OUT_FOR_DELIVERY":
    case "APPROVED":
      return "info";
    case "PROCESSING":
    case "CONFIRMED":
      return "primary";
    default:
      return "warning";
  }
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export default function OrderDetailsPage() {
  const { orderId } = useParams();

  const {
    selectedOrder,
    getOrderDetails,
    updateOrderStatus,
    createShipment,
    getShipmentTracking,
    cancelShipment,
    clearShipmentTracking,
    shipmentTracking,
    trackingLoading,
    trackingError,
    cancellingShipment,
  } = useOrderStore();

  const [status, setStatus] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [loadingShipment, setLoadingShipment] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const { exchangeRequests, fetchExchangeRequests } = useExchangeStore();

  useEffect(() => {
    if (orderId) getOrderDetails(orderId);
    return () => clearShipmentTracking();
  }, [orderId]);

  useEffect(() => {
    if (orderId) fetchExchangeRequests({ orderId, status: "ALL" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  useEffect(() => {
    if (selectedOrder) {
      setStatus(selectedOrder.orderStatus);
    }
  }, [selectedOrder]);

  const activeShipment = selectedOrder?.shipments?.[0] ?? null;

  useEffect(() => {
    if (orderId && activeShipment?.awbNumber && activeShipment.status !== "CANCELLED") {
      getShipmentTracking(orderId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, activeShipment?.awbNumber]);

  if (!selectedOrder) {
    return <Loader />;
  }

  const isCod = selectedOrder.paymentMethod?.toLowerCase() === "cod";

  const handleUpdateStatus = async () => {
    setUpdatingStatus(true);
    setStatusError(null);
    try {
      await updateOrderStatus(selectedOrder.id, status);
    } catch {
      setStatusError("Unable to update order status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCancelShipment = async () => {
    if (
      !window.confirm(
        "Cancel this shipment with Delhivery and mark the order as cancelled?",
      )
    ) {
      return;
    }

    setCancelError(null);
    try {
      await cancelShipment(selectedOrder.id);
      if (orderId) await getOrderDetails(orderId);
    } catch (err) {
      setCancelError(
        err instanceof Error ? err.message : "Unable to cancel the shipment.",
      );
    }
  };

  const shipmentCancellable =
    !!activeShipment &&
    activeShipment.status !== "CANCELLED" &&
    CANCELLABLE_ORDER_STATUSES.includes(selectedOrder.orderStatus);

  const trackingLooksDelivered =
    !!shipmentTracking?.currentStatus &&
    shipmentTracking.currentStatus.toLowerCase().includes("deliver") &&
    selectedOrder.orderStatus !== "DELIVERED" &&
    selectedOrder.orderStatus !== "CANCELLED";

  return (
    <div className="space-y-6">
      {/* HEADER CARD */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Order #{selectedOrder.orderNumber}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {selectedOrder.user.fullName} • {selectedOrder.user.email}
            </p>

            <div className="mt-3">
              <Badge color={statusBadgeColor(selectedOrder.orderStatus)}>
                {selectedOrder.orderStatus}
              </Badge>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="text-xl font-bold text-gray-800 dark:text-white">
              ₹{Number(selectedOrder.totalAmount ?? 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        {/* LEFT - ORDER STATUS */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white">
            Update Order Status
          </h3>

          <label className="mb-2 block text-sm text-gray-500">
            Order Status
          </label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm
                       focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                       dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          {activeShipment && activeShipment.status !== "CANCELLED" && (
            <p className="mt-2 text-xs text-gray-500">
              This only changes the status stored on the order. To cancel the
              courier booking too, use “Cancel Shipment” below.
            </p>
          )}

          {statusError && (
            <p className="mt-2 text-xs text-error-500">{statusError}</p>
          )}

          <Button
            className="mt-4 w-full"
            disabled={updatingStatus}
            onClick={handleUpdateStatus}
          >
            {updatingStatus ? <InlineLoader size={16} label="Updating..." /> : "Update Status"}
          </Button>
        </div>

        {/* RIGHT - ORDER INFO */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white">
            Order Info
          </h3>

          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Order Date</span>
              <span className="text-gray-800 dark:text-white">
                {formatDateTime(selectedOrder.placedAt)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500">Payment Status</span>
              <Badge
                size="sm"
                color={
                  selectedOrder.paymentStatus === "SUCCESS"
                    ? "success"
                    : selectedOrder.paymentStatus === "FAILED"
                      ? "error"
                      : "warning"
                }
              >
                {selectedOrder.paymentStatus}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500">Payment Method</span>
              <Badge size="sm" color={isCod ? "warning" : "info"}>
                {isCod ? "Cash on Delivery" : "Prepaid (Razorpay)"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500">Items</span>
              <span className="text-gray-800 dark:text-white">
                {selectedOrder.items?.length || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SHIPMENT CARD */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white">
            Shipment Details
          </h3>
          {activeShipment && (
            <Badge size="sm" color={statusBadgeColor(activeShipment.status)}>
              {activeShipment.status || "CREATED"}
            </Badge>
          )}
        </div>

        {activeShipment ? (
          <div className="space-y-5">
            {/* Shipment info grid, aligned like the Order Info card */}
            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 dark:border-gray-800">
                <span className="text-gray-500">AWB Number</span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {activeShipment.awbNumber || "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 dark:border-gray-800">
                <span className="text-gray-500">Courier</span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {activeShipment.courierName || "Delhivery"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                disabled={trackingLoading}
                onClick={() => orderId && getShipmentTracking(orderId)}
              >
                {trackingLoading ? <InlineLoader size={16} label="Refreshing..." /> : "Refresh Live Tracking"}
              </Button>

              {activeShipment.trackingUrl && (
                <a
                  href={activeShipment.trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-blue-600 underline"
                >
                  Open on Delhivery
                </a>
              )}

              {shipmentCancellable && (
                <button
                  type="button"
                  disabled={cancellingShipment}
                  onClick={handleCancelShipment}
                  className="ml-auto inline-flex items-center justify-center gap-2 rounded-lg border border-error-300 bg-white px-4 py-2 text-sm font-medium text-error-600 transition hover:bg-error-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-error-500/30 dark:bg-transparent dark:hover:bg-error-500/10"
                >
                  {cancellingShipment ? <InlineLoader size={16} label="Cancelling..." /> : "Cancel Shipment"}
                </button>
              )}
            </div>

            {cancelError && (
              <p className="text-xs text-error-500">{cancelError}</p>
            )}

            {activeShipment.status === "CANCELLED" && (
              <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10">
                This shipment has been cancelled with Delhivery.
              </div>
            )}

            {/* Live tracking */}
            <div className="rounded-lg border border-gray-100 p-4 dark:border-gray-800">
              <h4 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white">
                Live Tracking (Delhivery)
              </h4>

              {trackingLoading && !shipmentTracking && (
                <p className="text-sm text-gray-500">
                  Fetching live status from Delhivery...
                </p>
              )}

              {trackingError && (
                <p className="text-sm text-error-500">{trackingError}</p>
              )}

              {!trackingLoading && !trackingError && !shipmentTracking && (
                <p className="text-sm text-gray-500">
                  No live tracking data yet.
                </p>
              )}

              {shipmentTracking && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 rounded-lg bg-gray-50 p-4 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Current Status</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">
                        {shipmentTracking.currentStatus || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-sm text-gray-800 dark:text-white">
                        {shipmentTracking.statusLocation || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Last Updated</p>
                      <p className="text-sm text-gray-800 dark:text-white">
                        {formatDateTime(shipmentTracking.statusDateTime)}
                      </p>
                    </div>
                  </div>

                  {trackingLooksDelivered && (
                    <div className="flex flex-col gap-2 rounded-lg border border-success-200 bg-success-50 p-3 text-sm text-success-700 dark:border-success-500/30 dark:bg-success-500/10 sm:flex-row sm:items-center sm:justify-between">
                      <span>Delhivery reports this shipment as delivered.</span>
                      <Button
                        size="sm"
                        onClick={async () => {
                          setStatus("DELIVERED");
                          setUpdatingStatus(true);
                          try {
                            await updateOrderStatus(
                              selectedOrder.id,
                              "DELIVERED",
                            );
                          } finally {
                            setUpdatingStatus(false);
                          }
                        }}
                      >
                        Sync Order Status to Delivered
                      </Button>
                    </div>
                  )}

                  {shipmentTracking.scans.length > 0 && (
                    <ol className="space-y-4 border-l border-gray-200 pl-4 dark:border-gray-700">
                      {shipmentTracking.scans.map((scan, index) => (
                        <li key={`${scan.dateTime}-${index}`} className="relative">
                          <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-brand-500" />
                          <p className="text-sm font-medium text-gray-800 dark:text-white">
                            {scan.status || "Update"}
                          </p>
                          {scan.instructions && (
                            <p className="text-xs text-gray-500">
                              {scan.instructions}
                            </p>
                          )}
                          <p className="text-xs text-gray-400">
                            {[scan.location, formatDateTime(scan.dateTime)]
                              .filter(Boolean)
                              .join(" • ")}
                          </p>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
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
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm
                             dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value="DELHIVERY">Delhivery</option>
                </select>
              </div>

              {/* Shipment Type */}
              <div>
                <label className="text-sm text-gray-500">Shipment Type</label>
                <select
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm
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
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm
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
                  if (orderId) await getOrderDetails(orderId); // refresh UI
                } finally {
                  setLoadingShipment(false);
                }
              }}
            >
              {loadingShipment
                ? <InlineLoader size={16} label="Creating Shipment..." />
                : "Create Shipment (Generate AWB)"}
            </Button>
          </>
        )}
      </div>

      {/* EXCHANGE REQUESTS */}
      {exchangeRequests.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white">
              Exchange Requests
            </h3>
            <Link
              to="/exchange-requests"
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              Manage all exchanges →
            </Link>
          </div>

          <div className="space-y-3">
            {exchangeRequests.map((r) => (
              <div
                key={r.id}
                className="flex flex-col gap-2 rounded-lg border border-gray-100 p-3 text-sm dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-gray-800 dark:text-white">
                    {r.orderItem.product?.title || r.orderItem.productName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {[r.orderItem.variant?.color, r.orderItem.variant?.size]
                      .filter(Boolean)
                      .join(" / ") || "—"}{" "}
                    →{" "}
                    {[r.desiredVariant?.color, r.desiredVariant?.size]
                      .filter(Boolean)
                      .join(" / ") || "—"}
                  </p>
                  {r.status === "REJECTED" && r.adminNote && (
                    <p className="text-xs text-error-600">Reason: {r.adminNote}</p>
                  )}
                </div>
                <Badge size="sm" color={statusBadgeColor(r.status)}>
                  {r.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ITEMS CARD */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white">
          Ordered Items
        </h3>

        <div className="space-y-3">
          {selectedOrder.items?.map((item) => {
            if (!item.product) {
              return (
                <div
                  key={item.id}
                  className="rounded-lg border border-red-200 p-4 text-sm text-gray-500"
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
                  alt={item.product.name}
                  className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
                />

                <div className="min-w-0 flex-1">
                  <h4 className="truncate font-medium text-gray-800 dark:text-white">
                    {item.product.name}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {item.product.category?.name}
                  </p>

                  {(item.variant?.size || item.variant?.color) && (
                    <div className="mt-1 flex gap-2">
                      {item.variant?.color && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-white/5 dark:text-gray-300">
                          {item.variant.color}
                        </span>
                      )}
                      {item.variant?.size && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-white/5 dark:text-gray-300">
                          {item.variant.size}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0 text-right text-sm text-gray-500">
                  Qty: {item.quantity}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
