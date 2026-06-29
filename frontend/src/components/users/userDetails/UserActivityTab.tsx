import type { Activity } from "./types";

interface Props {
  activities: Activity[];
}

const eventStyles: Record<Activity["eventName"], { label: string; style: string }> = {
  PRODUCT_VIEW:      { label: "Product View",       style: "bg-gray-100 text-gray-600" },
  ADD_TO_CART:       { label: "Added to Cart",       style: "bg-blue-100 text-blue-700" },
  REMOVE_CART:       { label: "Removed from Cart",   style: "bg-orange-100 text-orange-700" },
  CHECKOUT_STARTED:  { label: "Checkout Started",    style: "bg-purple-100 text-purple-700" },
  PAYMENT_SUCCESS:   { label: "Payment Success",     style: "bg-green-100 text-green-700" },
  PAYMENT_FAILED:    { label: "Payment Failed",      style: "bg-red-100 text-red-700" },
};

export default function UserActivityTab({ activities }: Props) {
  if (!activities.length) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center text-gray-400">
        No activity found.
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">Event</th>
            <th className="px-4 py-3 font-medium">Metadata</th>
            <th className="px-4 py-3 font-medium">Date</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {activities.map((activity) => {
            const { label, style } = eventStyles[activity.eventName];
            return (
              <tr key={activity.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${style}`}>
                    {label}
                  </span>
                </td>

                <td className="px-4 py-3 text-gray-500 text-xs font-mono">
                  {activity.metadata
                    ? JSON.stringify(activity.metadata)
                    : "—"}
                </td>

                <td className="px-4 py-3 text-gray-500">
                  {new Date(activity.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  {new Date(activity.createdAt).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}