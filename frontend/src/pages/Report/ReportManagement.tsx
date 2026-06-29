import { useEffect, useMemo, useState } from "react";
import {
  ShoppingBag,
  IndianRupee,
  Package,
  AlertTriangle,
  TrendingUp,
  Download,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";

import { useReportStore } from "../../store/reportStore";

type RangeType = "daily" | "weekly" | "monthly" | "yearly";

export default function ReportManagement() {
  const [range, setRange] = useState<RangeType>("daily");

  const { data, loading, fetchReport } = useReportStore();

  useEffect(() => {
    void fetchReport(range);
  }, [range, fetchReport]);

  const downloadReport = () => {
    if (!data) return;

    const report = JSON.stringify(data, null, 2);

    const blob = new Blob([report], {
      type: "application/json",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `sales-report-${range}.json`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  };

  const topProductsChart = useMemo(() => {
    if (!data) return [];

    return data.topProducts.map((product) => ({
      name:
        product.productName.length > 18
          ? `${product.productName.slice(0, 18)}...`
          : product.productName,
      sold: product.soldQty,
      revenue: product.revenue,
    }));
  }, [data]);

  const revenueChart = useMemo(() => {
    if (!data) return [];

    return data.topProducts.map((product, index) => ({
      name: `#${index + 1}`,
      revenue: product.revenue,
    }));
  }, [data]);

  return (
    <>
      <PageMeta
        title="Reports Dashboard"
        description="Sales Analytics Dashboard"
      />

      <PageBreadcrumb pageTitle="Reports Dashboard" />

      <div className="space-y-6">
        {/* HEADER */}
        <ComponentCard title="Reports Dashboard">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Sales Analytics
              </h1>

              <p className="mt-1 text-gray-500">
                Monitor sales, inventory, revenue and order performance.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                ["daily", "weekly", "monthly", "yearly"] as RangeType[]
              ).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-all
                    ${
                      range === r
                        ? "bg-indigo-600 text-white shadow-lg"
                        : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                    }
                  `}
                >
                  {r}
                </button>
              ))}

              <button
                onClick={downloadReport}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-white shadow transition hover:bg-emerald-700"
              >
                <Download size={18} />
                Download
              </button>
            </div>
          </div>
        </ComponentCard>

        {loading && (
          <div className="rounded-2xl border bg-white p-20 text-center shadow-sm">
            Loading report...
          </div>
        )}

        {!loading && data && (
          <>
            {/* KPI */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
              <StatCard
                icon={<ShoppingBag />}
                title="Total Orders"
                value={data.summary.totalOrders}
                color="from-blue-500 to-blue-600"
              />

              <StatCard
                icon={<IndianRupee />}
                title="Revenue"
                value={`₹${data.summary.totalRevenue.toLocaleString()}`}
                color="from-emerald-500 to-green-600"
              />

              <StatCard
                icon={<Package />}
                title="Items Sold"
                value={data.summary.totalItemsSold}
                color="from-violet-500 to-purple-600"
              />

              <StatCard
                icon={<AlertTriangle />}
                title="Low Stock"
                value={data.lowStockProducts.length}
                color="from-red-500 to-red-600"
              />

              <StatCard
                icon={<TrendingUp />}
                title="Avg Order"
                value={`₹${data.summary.avgOrderValue.toFixed(2)}`}
                color="from-orange-500 to-amber-600"
              />
            </div>

            {/* PERIOD */}
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold">
                Report Period
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Start</p>

                  <p className="font-medium">
                    {new Date(data.start).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">End</p>

                  <p className="font-medium">
                    {new Date(data.end).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* CHARTS */}
            <div className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h3 className="mb-5 text-lg font-semibold">
                  Revenue Overview
                </h3>

                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={revenueChart}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="name" />

                    <YAxis />

                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#4F46E5"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h3 className="mb-5 text-lg font-semibold">
                  Top Selling Products
                </h3>

                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={topProductsChart}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="name" />

                    <YAxis />

                    <Tooltip />

                    <Bar
                      dataKey="sold"
                      fill="#10B981"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ORDERS + LOW STOCK */}
            <div className="grid gap-6 xl:grid-cols-2">
              {/* RECENT ORDERS */}
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h3 className="mb-5 text-lg font-semibold">
                  Recent Orders
                </h3>

                <div className="space-y-3">
                  {data.recentOrders.length > 0 ? (
                    data.recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between rounded-xl border p-4"
                      >
                        <div>
                          <h4 className="font-semibold">
                            #{order.orderNumber}
                          </h4>

                          <p className="text-sm text-gray-500">
                            {order.customerName}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold">
                            ₹
                            {order.totalAmount.toLocaleString()}
                          </p>

                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">
                      No orders found.
                    </p>
                  )}
                </div>
              </div>

              {/* LOW STOCK */}
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h3 className="mb-5 text-lg font-semibold text-red-600">
                  Low Stock Alerts
                </h3>

                <div className="space-y-3">
                  {data.lowStockProducts.length > 0 ? (
                    data.lowStockProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50 p-4"
                      >
                        <div>
                          <h4 className="font-semibold">
                            {product.productName}
                          </h4>

                          <p className="text-sm text-gray-500">
                            {product.sku}
                          </p>
                        </div>

                        <span className="rounded-full bg-red-500 px-3 py-1 text-sm font-semibold text-white">
                          {product.stock} left
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">
                      No low stock products.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* TOP PRODUCTS TABLE */}
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h3 className="mb-5 text-lg font-semibold">
                Top Products Performance
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3">Product</th>
                      <th className="p-3">Sold Qty</th>
                      <th className="p-3">Revenue</th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.topProducts.map((product) => (
                      <tr
                        key={product.productName}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-3">
                          {product.productName}
                        </td>

                        <td className="p-3">
                          {product.soldQty}
                        </td>

                        <td className="p-3 font-medium text-green-600">
                          ₹
                          {product.revenue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-gradient-to-r ${color} p-5 text-white shadow-lg`}
    >
      <div className="mb-4">{icon}</div>

      <p className="text-sm opacity-90">{title}</p>

      <h2 className="mt-2 text-3xl font-bold">
        {value}
      </h2>
    </div>
  );
}
