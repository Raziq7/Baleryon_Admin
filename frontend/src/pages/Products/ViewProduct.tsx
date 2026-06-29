import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import {
  getBrandName,
  getCategoryName,
  getProductImages,
  useProductStore,
} from "../../store/productStore";
import { getColorHex } from "../../constants/productColors";
import { confirmAlert } from "react-confirm-alert";
import ProductReviews from "./ProductReviews";

export default function ViewProduct() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<"details" | "reviews">("details");

  const navigate = useNavigate();
  const {
    getProductById,
    selectedProduct,
    loading,
    error,
    deleteProduct,
    clearSelectedProduct,
  } = useProductStore();

  useEffect(() => {
    if (id) getProductById(id);
    return () => clearSelectedProduct();
  }, [id, getProductById, clearSelectedProduct]);

  const product = selectedProduct;
  const images = product ? getProductImages(product) : [];

  const handleDelete = async () => {
    if (!id || !product) return;
    confirmAlert({
      title: "Delete product?",
      message: `"${product.productName}" and its Cloudinary images will be removed permanently.`,
      buttons: [
        {
          label: "Cancel",
        },
        {
          label: "Delete",
          onClick: async () => {
            try {
              await deleteProduct(id);
              navigate("/product-management");
            } catch {
              /* store */
            }
          },
        },
      ],
    });
  };

  return (
    <>
      <PageMeta title="View Product" description="Product details" />
      <PageBreadcrumb pageTitle="View Product" />

      <div className="mb-4 flex flex-wrap gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/product-management")}
        >
          Back to list
        </Button>
        {id && (
          <Button
            type="button"
            onClick={() => navigate(`/product-management/edit/${id}`)}
          >
            Edit Product
          </Button>
        )}
        {id && (
          <Button type="button" variant="outline" onClick={handleDelete}>
            Delete Product
          </Button>
        )}
      </div>
      <div className="flex gap-8">
        <button
          onClick={() => setActiveTab("details")}
          className={`pb-3 text-sm font-medium ${
            activeTab === "details"
              ? "border-b-2 border-brand-500 text-brand-500"
              : "text-gray-500"
          }`}
        >
          Product Details
        </button>

        <button
          onClick={() => setActiveTab("reviews")}
          className={`pb-3 text-sm font-medium ${
            activeTab === "reviews"
              ? "border-b-2 border-brand-500 text-brand-500"
              : "text-gray-500"
          }`}
        >
          Reviews ({product?.reviews?.length || 0})
        </button>
      </div>
      <ComponentCard title="Product Details">
        {loading && !product && (
          <p className="text-sm text-gray-500">Loading...</p>
        )}

        {error && <p className="text-sm text-error-500">{error}</p>}

        {product && (
          <>
            {activeTab === "details" && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium">{product.productName}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Category</p>
                    <p>{getCategoryName(product.category)}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Brand</p>
                    <p>{getBrandName(product.brand) || "—"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Price</p>
                    <p>₹{product.price}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Discount</p>
                    <p>{product.discount ? `${product.discount}%` : "—"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Returnable</p>
                    <p>{product.isReturn ? "Yes" : "No"}</p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs text-gray-500">Colors</p>

                  <div className="flex flex-wrap gap-2">
                    {(product.colors?.length
                      ? product.colors
                      : product.color
                        ? [{ name: product.color }]
                        : []
                    ).map((c) => (
                      <span
                        key={c.name}
                        className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
                      >
                        <span
                          className="h-4 w-4 rounded-full border"
                          style={{
                            backgroundColor: getColorHex(
                              c.name,
                              c.hex ?? undefined,
                            ),
                          }}
                        />

                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs text-gray-500">Sizes & Stock</p>

                  <ul className="flex flex-wrap gap-2">
                    {product.sizes?.map((s) => (
                      <li
                        key={s.size}
                        className="rounded-lg border px-3 py-1 text-sm dark:border-gray-700"
                      >
                        {s.size}: {s.quantity}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Description</p>

                  <p className="whitespace-pre-wrap text-sm">
                    {product.description}
                  </p>
                </div>

                {product.note && (
                  <div>
                    <p className="text-xs text-gray-500">Note</p>

                    <p className="text-sm">{product.note}</p>
                  </div>
                )}

                <div>
                  <p className="mb-2 text-xs text-gray-500">Images</p>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {images.map((img) => (
                      <a
                        key={img.id}
                        href={img.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block overflow-hidden rounded-lg border dark:border-gray-700"
                      >
                        <img
                          src={img.url}
                          alt=""
                          className="h-32 w-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <ProductReviews reviews={product.reviews || []} />
            )}
          </>
        )}
      </ComponentCard>

      {!loading && !product && !error && (
        <p className="text-sm text-gray-500">
          Product not found.{" "}
          <Link to="/product-management" className="text-brand-500">
            Go back
          </Link>
        </p>
      )}
    </>
  );
}
