import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import PaginationControls from "../ui/pagination/PaginationControls";
import Button from "../ui/button/Button";
import {
  getCategoryName,
  getProductImageUrl,
  useProductStore,
} from "../../store/productStore";
import { getColorHex } from "../../constants/productColors.ts";
import { confirmAlert } from "react-confirm-alert";

export default function ProductTable() {
  const navigate = useNavigate();
  const {
    products,
    pageNo,
    totalPages,
    loading,
    error,
    fetchProducts,
    deleteProduct,
  } = useProductStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts(pageNo);
  }, [fetchProducts, pageNo]);

  const totalStock = (sizes: { size: string; quantity: number }[]) =>
    sizes?.reduce((sum, s) => sum + (s.quantity || 0), 0) ?? 0;

  const confirmDelete = (productId: string, productName: string) => {
    confirmAlert({
      title: "Delete product?",
      message: `"${productName}" and its Cloudinary images will be removed permanently.`,
      buttons: [
        {
          label: "Cancel",
        },
        {
          label: "Delete",
          onClick: async () => {
            setDeletingId(productId);
            try {
              await deleteProduct(productId);
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {loading && (
        <p className="px-5 py-4 text-sm text-gray-500">Loading products...</p>
      )}
      {error && (
        <p className="px-5 py-4 text-sm text-error-500">{error}</p>
      )}
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Image
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Product Name
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Category
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Price
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Discount
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Color
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Stock
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Returnable
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {!loading && products.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="px-4 py-8 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                >
                  No products found. Add your first product to get started.
                </TableCell>
              </TableRow>
            )}
            {products.map((product) => {
              const imageUrl = getProductImageUrl(product);
              return (
                <TableRow key={product._id}>
                  <TableCell className="px-4 py-3 text-start">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.productName}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 text-theme-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {product.productName}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {getCategoryName(product.category)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    ₹{product.price}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {product.discount ? `${product.discount}%` : "—"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    {(() => {
                      const colorList =
                        product.colors?.length
                          ? product.colors
                          : product.color
                            ? [{ name: product.color }]
                            : [];
                      return colorList.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {colorList.map((c) => (
                            <span
                              key={`${c.name}-${c.hex || ""}`}
                              title={c.name}
                              className="inline-block h-5 w-5 rounded-full border border-gray-300"
                              style={{
                                backgroundColor: getColorHex(
                                  c.name,
                                  c.hex ?? undefined
                                ),
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-theme-sm">—</span>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {totalStock(product.sizes)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {product.isReturn ? "Yes" : "No"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/product-management/view/${product._id}`)
                        }
                        className="rounded-full border px-3 py-1.5 text-sm dark:border-gray-700"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/product-management/edit/${product._id}`)
                        }
                        className="rounded-full border px-3 py-1.5 text-sm dark:border-gray-700"
                      >
                        Edit
                      </button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={deletingId === product._id}
                        onClick={() =>
                          confirmDelete(product._id, product.productName)
                        }
                      >
                        {deletingId === product._id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <PaginationControls
        currentPage={pageNo}
        totalPages={totalPages}
        onPageChange={(page) => fetchProducts(page)}
      />
    </div>
  );
}
