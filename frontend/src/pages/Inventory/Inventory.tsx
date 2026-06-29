import { useEffect, useMemo, useState } from "react";
import {
  useInventoryStore,
  type InventoryVariant,
} from "../../store/inventoryStore";

export default function InventoryTab() {
  const { items, logs, fetchInventory, fetchLogs, adjustStock } =
    useInventoryStore();

  const [selected, setSelected] = useState<InventoryVariant | null>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const [type, setType] = useState<string>("ADJUSTMENT");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchInventory();
    fetchLogs();
  }, []);

  // -----------------------------
  // FILTERED ITEMS
  // -----------------------------
  const filteredItems = useMemo(() => {
    return items.filter(
      (i) =>
        i.product.title.toLowerCase().includes(search.toLowerCase()) ||
        i.sku.toLowerCase().includes(search.toLowerCase()),
    );
  }, [items, search]);

  // -----------------------------
  // STATS
  // -----------------------------
  const stats = useMemo(() => {
    const lowStock = items.filter((i) => i.stock > 0 && i.stock < 10).length;
    const outStock = items.filter((i) => i.stock === 0).length;

    return {
      total: items.length,
      lowStock,
      outStock,
    };
  }, [items]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Inventory Control Center
            </h2>
            <p className="text-sm text-gray-500">
              Manage stock levels, variants & adjustments
            </p>
          </div>

          {/* SEARCH */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SKU or product..."
            className="w-full rounded-xl border px-4 py-2 md:w-80"
          />
        </div>

        {/* STATS */}
        <div className="mt-5 grid grid-cols-3 gap-4">
          <Stat label="Total Items" value={stats.total} color="text-blue-600" />
          <Stat
            label="Low Stock"
            value={stats.lowStock}
            color="text-yellow-600"
          />
          <Stat
            label="Out of Stock"
            value={stats.outStock}
            color="text-red-600"
          />
        </div>
      </div>

      {/* INVENTORY GRID */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600">
                  {item.product.title}
                </h3>
                <p className="text-xs text-gray-500">SKU: {item.sku}</p>
              </div>

              <StockBadge stock={item.stock} />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Size: {item.size || "-"} | Color: {item.color || "-"}
              </div>

              <button
                onClick={() => setSelected(item)}
                className="rounded-xl bg-indigo-600 px-4 py-1.5 text-sm text-white transition hover:bg-indigo-700"
              >
                Adjust
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODERN MODAL */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">Adjust Inventory</h3>

            <p className="mt-1 text-sm text-gray-500">
              {selected.product.title} • {selected.sku}
            </p>

            {/* QUANTITY */}
            <div className="mt-5">
              <label className="text-sm font-medium">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border px-3 py-2"
              />
            </div>

            {/* TYPE */}
            <div className="mt-4">
              <label className="text-sm font-medium">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2"
              >
                <option value="PURCHASE">Purchase (+)</option>
                <option value="RETURN">Return (+)</option>
                <option value="SALE">Sale (-)</option>
                <option value="DAMAGE">Damage (-)</option>
                <option value="ADJUSTMENT">Adjustment (Set)</option>
              </select>
            </div>

            {/* ACTIONS */}
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setSelected(null)}
                className="rounded-xl border px-4 py-2"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  await adjustStock(selected.id, {
                    quantity,
                    type,
                  });

                  setSelected(null);
                  setQuantity(0);
                }}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-white"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGS TIMELINE */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Inventory Activity</h3>

        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between rounded-xl border p-3"
            >
              <div>
                <p className="font-medium">{log.variant.product.title}</p>
                <p className="text-xs text-gray-500">{log.variant.sku}</p>
              </div>

              <div className="text-right">
                <span className="text-sm font-semibold">{log.type}</span>
                <p className="text-xs text-gray-500">Qty: {log.quantity}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-xl border bg-gray-50 p-4 text-center">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
        Out
      </span>
    );

  if (stock < 10)
    return (
      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
        Low
      </span>
    );

  return (
    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
      {stock}
    </span>
  );
}
