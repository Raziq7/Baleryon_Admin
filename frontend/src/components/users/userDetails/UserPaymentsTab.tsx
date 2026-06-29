import type { Payment } from "./types";

interface Props {
  payments: Payment[];
}

const statusStyles: Record<Payment["paymentStatus"], string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  SUCCESS: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-blue-100 text-blue-700",
};

export default function UserPaymentsTab({ payments }: Props) {
  if (!payments.length) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center text-gray-400">
        No payments found.
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">Order</th>
            <th className="px-4 py-3 font-medium">Transaction ID</th>
            <th className="px-4 py-3 font-medium">Gateway</th>
            <th className="px-4 py-3 font-medium">Amount</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Date</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {payments.map((payment) => (
            <tr key={payment.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-xs text-gray-600">
                {payment.orderNumber}
              </td>

              <td className="px-4 py-3 font-mono text-xs text-gray-600">
                {payment.transactionId ?? "—"}
              </td>

              <td className="px-4 py-3 capitalize text-gray-700">
                {payment.paymentGateway ?? "—"}
              </td>

              <td className="px-4 py-3 font-medium">
                ₹{payment.amount ?? "—"}
              </td>

              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[payment.paymentStatus]}`}
                >
                  {payment.paymentStatus}
                </span>
              </td>

              <td className="px-4 py-3 text-gray-500">
                {new Date(
                  payment.paidAt ?? payment.createdAt
                ).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}