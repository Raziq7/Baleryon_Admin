import { useState } from "react";
import { useCouponStore, type CouponType } from "../../store/couponStore";

export default function AddCouponForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const { createCoupon } = useCouponStore();

  const [form, setForm] = useState<{
    code: string;
    type: CouponType;
    value: string;
    minimumOrder: string;
    usageLimit: string;
  }>({
    code: "",
    type: "PERCENTAGE",
    value: "",
    minimumOrder: "",
    usageLimit: "",
  });

  const isValid =
    form.code.trim() !== "" &&
    form.value.trim() !== "";

  const handleSubmit = async () => {
    if (!isValid) return;

    await createCoupon({
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: Number(form.value),
      minimumOrder: form.minimumOrder
        ? Number(form.minimumOrder)
        : undefined,
      usageLimit: form.usageLimit
        ? Number(form.usageLimit)
        : undefined,
    });

    onSuccess?.();
  };

  return (
    <div className="p-2">
      <h2 className="text-lg font-semibold">Create Coupon</h2>
      <p className="mb-4 text-sm text-gray-500">
        Add a new discount coupon
      </p>

      <div className="space-y-3">

        {/* CODE */}
        <input
          className="w-full rounded-lg border p-2"
          placeholder="Coupon Code"
          value={form.code}
          onChange={(e) =>
            setForm({ ...form, code: e.target.value })
          }
        />

        {/* TYPE */}
        <select
          className="w-full rounded-lg border p-2"
          value={form.type}
          onChange={(e) =>
            setForm({
              ...form,
              type: e.target.value as CouponType,
            })
          }
        >
          <option value="PERCENTAGE">Percentage</option>
          <option value="FIXED">Fixed</option>
        </select>

        {/* VALUE */}
        <input
          className="w-full rounded-lg border p-2"
          type="text"
          inputMode="numeric"
          placeholder="Value"
          value={form.value}
          onChange={(e) => {
            if (/^\d*$/.test(e.target.value)) {
              setForm({ ...form, value: e.target.value });
            }
          }}
        />

        {/* MIN ORDER */}
        <input
          className="w-full rounded-lg border p-2"
          type="text"
          inputMode="numeric"
          placeholder="Minimum Order"
          value={form.minimumOrder}
          onChange={(e) => {
            if (/^\d*$/.test(e.target.value)) {
              setForm({ ...form, minimumOrder: e.target.value });
            }
          }}
        />

        {/* USAGE LIMIT */}
        <input
          className="w-full rounded-lg border p-2"
          type="text"
          inputMode="numeric"
          placeholder="Usage Limit"
          value={form.usageLimit}
          onChange={(e) => {
            if (/^\d*$/.test(e.target.value)) {
              setForm({ ...form, usageLimit: e.target.value });
            }
          }}
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex justify-end gap-2">
        <button
          className="rounded-lg border px-4 py-2 hover:bg-gray-100"
          onClick={onSuccess}
        >
          Cancel
        </button>

        <button
          disabled={!isValid}
          className={`rounded-lg px-4 py-2 text-white ${
            isValid
              ? "bg-indigo-600 hover:bg-indigo-700"
              : "cursor-not-allowed bg-indigo-300"
          }`}
          onClick={handleSubmit}
        >
          Save
        </button>
      </div>
    </div>
  );
}