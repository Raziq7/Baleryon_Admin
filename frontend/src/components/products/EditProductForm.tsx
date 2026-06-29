import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import Input from "../input/InputField";
import TextArea from "../input/TextArea";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import {
  getProductImages,
  useProductStore,
  type ProductImageRecord,
  type ProductSize,
} from "../../store/productStore";
import { useCatalogStore } from "../../store/catalogStore";
import ColorMultiSelect, { type SelectedColor } from "./ColorMultiSelect";
import { getColorHex } from "../../constants/productColors";

const selectClassName =
  "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

type SizeRow = ProductSize & { id: string };

type NewImageItem = {
  id: string;
  file: File;
  preview: string;
};

const emptySize = (): SizeRow => ({
  id: crypto.randomUUID(),
  size: "",
  quantity: 0,
});

type Props = { productId: string };

export default function EditProductForm({ productId }: Props) {
  const navigate = useNavigate();
  const {
    getProductById,
    updateProduct,
    selectedProduct,
    loading,
    error,
    updateSuccess,
    resetUpdateSuccess,
    clearSelectedProduct,
  } = useProductStore();
  const { categories, brands, fetchCategories, fetchBrands } = useCatalogStore();

  const [form, setForm] = useState({
    productName: "",
    description: "",
    price: "",
    discount: "",
    categoryId: "",
    brandId: "",
    note: "",
    productDetails: "",
    isReturn: false,
  });
  const [sizes, setSizes] = useState<SizeRow[]>([emptySize()]);
  const [colors, setColors] = useState<SelectedColor[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImageRecord[]>(
    []
  );
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<NewImageItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);
  const newImagesRef = useRef(newImages);
  newImagesRef.current = newImages;

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    getProductById(productId);
    return () => clearSelectedProduct();
  }, [productId, fetchCategories, fetchBrands, getProductById, clearSelectedProduct]);

  useEffect(() => {
    if (!selectedProduct || initialized) return;

    const categoryId =
      typeof selectedProduct.category === "object"
        ? selectedProduct.category?.id || ""
        : "";

    setForm({
      productName: selectedProduct.productName || "",
      description: selectedProduct.description || "",
      price: String(selectedProduct.price ?? ""),
      discount: String(selectedProduct.discount ?? ""),
      categoryId,
      brandId: selectedProduct.brand?.id || "",
      note: selectedProduct.note || "",
      productDetails: selectedProduct.productDetails || "",
      isReturn: !!selectedProduct.isReturn,
    });

    setSizes(
      selectedProduct.sizes?.length
        ? selectedProduct.sizes.map((s) => ({
            id: crypto.randomUUID(),
            size: s.size,
            quantity: s.quantity,
          }))
        : [emptySize()]
    );

    setColors(
      selectedProduct.colors?.length
        ? selectedProduct.colors.map((c) => ({
            id: crypto.randomUUID(),
            name: c.name,
            hex: getColorHex(c.name, c.hex ?? undefined),
          }))
        : selectedProduct.color
          ? [
              {
                id: crypto.randomUUID(),
                name: selectedProduct.color,
                hex: getColorHex(selectedProduct.color),
              },
            ]
          : []
    );

    setExistingImages(getProductImages(selectedProduct));
    setInitialized(true);
  }, [selectedProduct, initialized]);

  useEffect(() => {
    return () => {
      newImagesRef.current.forEach((item) =>
        URL.revokeObjectURL(item.preview)
      );
    };
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      resetUpdateSuccess();
      navigate("/product-management");
    }
  }, [updateSuccess, navigate, resetUpdateSuccess]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = e.target;
    const { name, type } = target;
    const value =
      type === "checkbox"
        ? (target as HTMLInputElement).checked
        : target.value;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateSize = (
    id: string,
    field: keyof ProductSize,
    value: string | number
  ) => {
    setSizes((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const addSizeRow = () => setSizes((prev) => [...prev, emptySize()]);
  const removeSizeRow = (id: string) => {
    if (sizes.length === 1) return;
    setSizes((prev) => prev.filter((row) => row.id !== id));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const items: NewImageItem[] = Array.from(e.target.files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewImages((prev) => [...prev, ...items]);
    e.target.value = "";
  };

  const removeExistingImage = (id: string) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== id));
    if (!id.startsWith("legacy-")) {
      setRemovedImageIds((prev) => [...prev, id]);
    }
  };

  const removeNewImage = (id: string) => {
    setNewImages((prev) => {
      const item = prev.find((img) => img.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((img) => img.id !== id);
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.productName.trim())
      newErrors.productName = "Product name is required.";
    if (!form.description.trim())
      newErrors.description = "Description is required.";
    if (!form.price || Number(form.price) <= 0)
      newErrors.price = "Valid price is required.";
    if (!form.categoryId) newErrors.categoryId = "Category is required.";

    const totalImages =
      existingImages.length + newImages.length;
    if (totalImages === 0) {
      newErrors.images = "At least one image is required.";
    }

    const validSizes = sizes.filter((s) => s.size.trim() && s.quantity > 0);
    if (validSizes.length === 0) {
      newErrors.sizes = "Add at least one size with quantity.";
    }
    if (colors.length === 0) {
      newErrors.colors = "Add at least one color.";
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const validSizes = sizes
      .filter((s) => s.size.trim() && s.quantity > 0)
      .map(({ size, quantity }) => ({ size, quantity }));

    const formData = new FormData();
    formData.append("productName", form.productName.trim());
    formData.append("description", form.description.trim());
    formData.append("price", form.price);
    if (form.discount) formData.append("discount", form.discount);
    formData.append("category", JSON.stringify({ id: form.categoryId }));
    if (form.brandId) {
      formData.append("brand", JSON.stringify({ id: form.brandId }));
    }
    formData.append(
      "colors",
      JSON.stringify(colors.map(({ name, hex }) => ({ name, hex })))
    );
    if (form.note) formData.append("note", form.note);
    if (form.productDetails)
      formData.append("productDetails", form.productDetails);
    formData.append("isReturn", String(form.isReturn));
    formData.append("sizes", JSON.stringify(validSizes));
    formData.append(
      "deletedImageIds",
      JSON.stringify(removedImageIds)
    );

    newImages.forEach((item) => formData.append("files", item.file));

    try {
      await updateProduct(productId, formData);
    } catch {
      /* store */
    }
  };

  if (!initialized && loading) {
    return <p className="text-sm text-gray-500">Loading product...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="text-sm text-error-500 rounded-lg border border-error-200 bg-error-50 px-4 py-3">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label>Product Name</Label>
          <Input
            name="productName"
            value={form.productName}
            onChange={handleChange}
            error={!!errors.productName}
            hint={errors.productName}
          />
        </div>
        <div>
          <Label>Category</Label>
          <select
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            className={selectClassName}
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1.5 text-xs text-error-500">{errors.categoryId}</p>
          )}
        </div>
        <div>
          <Label>Brand (optional)</Label>
          <select
            name="brandId"
            value={form.brandId}
            onChange={handleChange}
            className={selectClassName}
          >
            <option value="">Select brand</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Price (₹)</Label>
          <Input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            error={!!errors.price}
            hint={errors.price}
          />
        </div>
        <div>
          <Label>Discount (%)</Label>
          <Input
            type="number"
            name="discount"
            value={form.discount}
            onChange={handleChange}
          />
        </div>
        <div className="flex items-end gap-2 pb-2 sm:col-span-2">
          <input
            type="checkbox"
            id="isReturnEdit"
            name="isReturn"
            checked={form.isReturn}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="isReturnEdit">Returnable product</Label>
        </div>
      </div>

      <ColorMultiSelect
        value={colors}
        onChange={setColors}
        error={errors.colors}
      />

      <div>
        <Label>Description</Label>
        <TextArea
          rows={3}
          value={form.description}
          onChange={(val) => setForm((p) => ({ ...p, description: val }))}
          error={!!errors.description}
          hint={errors.description}
        />
      </div>

      <div>
        <Label>Product Details</Label>
        <TextArea
          rows={3}
          value={form.productDetails}
          onChange={(val) => setForm((p) => ({ ...p, productDetails: val }))}
        />
      </div>

      <div>
        <Label>Note</Label>
        <Input name="note" value={form.note} onChange={handleChange} />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <Label>Sizes & Stock</Label>
          <Button type="button" size="sm" variant="outline" onClick={addSizeRow}>
            Add Size
          </Button>
        </div>
        {errors.sizes && (
          <p className="mb-2 text-xs text-error-500">{errors.sizes}</p>
        )}
        <div className="space-y-3">
          {sizes.map((row) => (
            <div key={row.id} className="flex flex-wrap items-end gap-3">
              <div className="min-w-[120px] flex-1">
                <Input
                  placeholder="Size"
                  value={row.size}
                  onChange={(e) => updateSize(row.id, "size", e.target.value)}
                />
              </div>
              <div className="min-w-[120px] flex-1">
                <Input
                  type="number"
                  placeholder="Quantity"
                  value={row.quantity || ""}
                  onChange={(e) =>
                    updateSize(row.id, "quantity", Number(e.target.value) || 0)
                  }
                />
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => removeSizeRow(row.id)}
                disabled={sizes.length === 1}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Product Images</Label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="block w-full text-sm"
        />
        {errors.images && (
          <p className="mt-1.5 text-xs text-error-500">{errors.images}</p>
        )}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {existingImages.map((img) => (
            <div
              key={img.id}
              className="group relative overflow-hidden rounded-lg border dark:border-gray-700"
            >
              <img
                src={img.url}
                alt=""
                className="h-28 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeExistingImage(img.id)}
                className="absolute right-1 top-1 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white"
              >
                Remove
              </button>
            </div>
          ))}
          {newImages.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-lg border dark:border-gray-700"
            >
              <img
                src={item.preview}
                alt=""
                className="h-28 w-full object-cover"
              />
              <span className="absolute left-1 top-1 rounded bg-brand-500 px-1 text-[10px] text-white">
                New
              </span>
              <button
                type="button"
                onClick={() => removeNewImage(item.id)}
                className="absolute right-1 top-1 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Update Product"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/product-management")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
