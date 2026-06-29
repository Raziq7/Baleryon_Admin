import { useCouponStore } from "../../store/couponStore";

export default function CouponTable() {
  const { coupons, deleteCoupon } = useCouponStore();

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      {/* TABLE HEADER (optional future upgrade) */}
      <div className="border-b bg-gray-50 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-700">
          All Coupons
        </h3>
      </div>

      {/* EMPTY STATE */}
      {coupons.length === 0 ? (
        <div className="p-10 text-center text-sm text-gray-500">
          No coupons found
        </div>
      ) : (
        <div className="divide-y">
          {coupons.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between px-4 py-4 hover:bg-gray-50"
            >
              {/* LEFT SIDE */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">
                    {c.code}
                  </span>

                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      c.type === "PERCENTAGE"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-green-50 text-green-600"
                    }`}
                  >
                    {c.type}
                  </span>
                </div>

                <div className="mt-1 text-xs text-gray-500">
                  {c.type === "PERCENTAGE"
                    ? `${c.value}% discount`
                    : `₹${c.value} discount`}{" "}
                  • Min Order ₹{c.minimumOrder}
                </div>

                <div className="text-[11px] text-gray-400">
                  Used: {c.usedCount} / {c.usageLimit || "∞"}
                </div>
              </div>

              {/* RIGHT SIDE ACTIONS */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => deleteCoupon(c.id)}
                  className="rounded-lg px-3 py-1 text-xs font-medium text-red-500 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}