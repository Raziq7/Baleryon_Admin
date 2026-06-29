import type { UserStats } from "./types";

interface Props {
  stats: UserStats;
}

export default function UserStatsCards({ stats }: Props) {
  const cards = [
    {
      title: "Orders",
      value: stats.totalOrders,
    },
    {
      title: "Revenue",
      value: `₹${stats.totalSpent.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
    },
    {
      title: "Pending",
      value: stats.pendingOrders,
    },
    {
      title: "Reviews",
      value: stats.totalReviews,
    },
  ];

  console.log(cards, "cardscardscardscardscardscardscards");

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.title} className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">{card.title}</p>

          <h3 className="mt-2 text-2xl font-bold">{card.value}</h3>
        </div>
      ))}
    </div>
  );
}
