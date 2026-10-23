import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useExchangeStore } from "../../store/exchangeStore";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import Loader, { InlineLoader } from "../../components/common/Loader";

type BadgeColor = "primary" | "success" | "error" | "warning" | "info" | "light" | "dark";

const FILTERS = ["ALL", "REQUESTED", "APPROVED", "REJECTED", "COMPLETED"] as const;

function statusBadgeColor(status: string): BadgeColor {
  switch (status) {
    case "APPROVED":
      return "info";
    case "REJECTED":
      return "error";
    case "COMPLETED":
      return "success";
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

function variantLabel(v?: { color: string | null; size: string | null } | null) {
  if (!v) return "—";
  return [v.color, v.size].filter(Boolean).join(" / ") || "—";
}

export default function ExchangeManagement() {
  const {
    exchangeRequests,
    loading,
    error,
    actionLoadingId,
    fetchExchangeRequests,
    approveExchange,
    rejectExchange,
    completeExchange,
    retryExchangeShipment,
  } = useExchangeStore();

  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("REQUESTED");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    fetchExchangeRequests({ status: filter });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function handleApprove(id: string) {
    setActionError(null);
    try {
      await approveExchange(id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to approve");
    }
  }

  async function handleReject(id: string) {
    if (!rejectReason.trim()) return;
    setActionError(null);
    try {
      await rejectExchange(id, rejectReason.trim());
      setRejectingId(null);
      setRejectReason("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to cancel");
    }
  }

  async function handleComplete(id: string) {
    setActionError(null);
    try {
      await completeExchange(id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to complete");
    }
  }

  async function handleRetry(id: string) {
    setActionError(null);
    try {
      await retryExchangeShipment(id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to retry shipment");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
          Exchange Requests
        </h1>

        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition ${
                filter === f
                  ? "bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {(error || actionError) && (
        <p className="text-sm text-error-500">{actionError || error}</p>
      )}

      {loading ? (
        <Loader />
      ) : exchangeRequests.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500 dark:border-white/[0.05] dark:bg-white/[0.03]">
          No {filter !== "ALL" ? filter.toLowerCase() : ""} exchange requests.
        </div>
      ) : (
        <div className="space-y-4">
          {exchangeRequests.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03]"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Link
                    to={`/order-management/${r.orderItem.order.id}`}
                    className="text-sm font-semibold text-blue-600 hover:underline"
                  >
                    Order #{r.orderItem.order.orderNumber}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {r.orderItem.order.user.fullName} • {r.orderItem.order.user.email}
                  </p>
                  <p className="text-sm text-gray-800 dark:text-white mt-2">
                    {r.orderItem.product?.title || r.orderItem.productName}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {variantLabel(r.orderItem.variant)} → {variantLabel(r.desiredVariant)}
                  </p>
                  {r.reason && (
                    <p className="text-xs text-gray-500 mt-1">Customer note: {r.reason}</p>
                  )}
                  {r.status === "REJECTED" && r.adminNote && (
                    <p className="text-xs text-error-600 mt-1">
                      Cancelled — reason shown to customer: {r.adminNote}
                    </p>
                  )}
                  {r.status === "APPROVED" && (
                    <p className="text-xs text-gray-500 mt-1">
                      Pickup shipment: {r.pickupShipmentId ? "created" : "not created yet"} ·
                      {" "}Replacement shipment: {r.replacementShipmentId ? "created" : "not created yet"}
                    </p>
                  )}
                </div>

                <div className="text-left sm:text-right">
                  <Badge size="sm" color={statusBadgeColor(r.status)}>
                    {r.status}
                  </Badge>
                  <p className="text-xs text-gray-400 mt-2">{formatDateTime(r.createdAt)}</p>
                </div>
              </div>

              {r.status === "REQUESTED" && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    disabled={actionLoadingId === r.id}
                    onClick={() => handleApprove(r.id)}
                  >
                    {actionLoadingId === r.id ? (
                      <InlineLoader size={14} label="Approving..." />
                    ) : (
                      "Approve"
                    )}
                  </Button>

                  {rejectingId === r.id ? (
                    <div className="flex flex-1 min-w-[240px] items-center gap-2">
                      <input
                        autoFocus
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Reason shown to the customer..."
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      />
                      <button
                        disabled={!rejectReason.trim() || actionLoadingId === r.id}
                        onClick={() => handleReject(r.id)}
                        className="rounded-lg border border-error-300 bg-white px-3 py-1.5 text-xs font-medium text-error-600 hover:bg-error-50 disabled:opacity-50"
                      >
                        Confirm Cancel
                      </button>
                      <button
                        onClick={() => {
                          setRejectingId(null);
                          setRejectReason("");
                        }}
                        className="text-xs text-gray-500"
                      >
                        Back
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRejectingId(r.id)}
                      className="rounded-lg border border-error-300 bg-white px-4 py-1.5 text-xs font-medium text-error-600 hover:bg-error-50"
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
              )}

              {r.status === "APPROVED" && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {(!r.pickupShipmentId || !r.replacementShipmentId) && (
                    <button
                      disabled={actionLoadingId === r.id}
                      onClick={() => handleRetry(r.id)}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200"
                    >
                      {actionLoadingId === r.id ? (
                        <InlineLoader size={14} label="Retrying..." />
                      ) : (
                        "Retry Delhivery Shipment"
                      )}
                    </button>
                  )}
                  <Button size="sm" disabled={actionLoadingId === r.id} onClick={() => handleComplete(r.id)}>
                    {actionLoadingId === r.id ? (
                      <InlineLoader size={14} label="Completing..." />
                    ) : (
                      "Mark Complete (item received back)"
                    )}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
