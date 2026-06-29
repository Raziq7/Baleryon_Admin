import type { Product } from "./types";

interface Props {
  products: Product[];
}

export default function UserProductsTab({ products }: Props) {
  if (!products.length) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center text-gray-400">
        No products found.
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">Product</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Brand</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Added</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {product.images.find((i) => i.isPrimary)?.imageUrl ? (
                    <img
                      src={product.images.find((i) => i.isPrimary)!.imageUrl}
                      alt={product.title}
                      className="h-10 w-10 rounded-lg object-cover border"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-gray-100 border" />
                  )}
                  <span className="font-medium text-gray-800 line-clamp-1">
                    {product.title}
                  </span>
                </div>
              </td>

              <td className="px-4 py-3 text-gray-500">
                {product.category?.name ?? "—"}
              </td>

              <td className="px-4 py-3 text-gray-500">
                {product.brand?.name ?? "—"}
              </td>

              <td className="px-4 py-3">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-800">
                    ₹{product.salePrice ?? product.basePrice}
                  </span>
                  {product.salePrice && (
                    <span className="text-xs text-gray-400 line-through">
                      ₹{product.basePrice}
                    </span>
                  )}
                </div>
              </td>

              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    product.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {product.isActive ? "Active" : "Inactive"}
                </span>
              </td>

              <td className="px-4 py-3 text-gray-500">
                {new Date(product.createdAt).toLocaleDateString("en-IN", {
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