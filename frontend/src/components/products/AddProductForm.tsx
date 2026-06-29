import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import Input from "../input/InputField";
import TextArea from "../input/TextArea";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import { useProductStore, type ProductSize } from "../../store/productStore";
import { useCatalogStore } from "../../store/catalogStore";
import ColorMultiSelect, {
  type SelectedColor,
} from "./ColorMultiSelect";

const selectClassName =
  "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

type SizeRow = ProductSize & { id: string };

type ImageItem = {
  id: string;
  file: File;
  preview: string;
};

const emptySize = (): SizeRow => ({
  id: crypto.randomUUID(),
  size: "",
  quantity: 0,
});

export default function AddProductForm() {
  const navigate = useNavigate();
  const { addProduct, loading, error, addSuccess, resetAddSuccess } =
    useProductStore();
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
  const [images, setImages] = useState<ImageItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const imagesRef = useRef(images);
  imagesRef.current = images;

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, [fetchCategories, fetchBrands]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((item) => URL.revokeObjectURL(item.preview));
    };
  }, []);

  useEffect(() => {
    if (addSuccess) {
      resetAddSuccess();
      navigate("/product-management");
    }
  }, [addSuccess, navigate, resetAddSuccess]);

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

    const newItems: ImageItem[] = Array.from(e.target.files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newItems]);
    e.target.value = "";
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
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
    if (!form.categoryId)
      newErrors.categoryId = "Category is required.";
    if (images.length === 0) newErrors.images = "At least one image is required.";

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
    formData.append(
      "category",
      JSON.stringify({ id: form.categoryId })
    );
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

    images.forEach((item) => formData.append("files", item.file));

    try {
      await addProduct(formData);
    } catch {
      // error handled in store
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="text-sm text-error-500 rounded-lg border border-error-200 bg-error-50 px-4 py-3 dark:border-error-500/30 dark:bg-error-500/10">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label>Product Name</Label>
          <Input
            name="productName"
            placeholder="Enter product name"
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
          {categories.length === 0 && (
            <p className="mt-1.5 text-xs text-gray-500">
              No categories yet. Add them under Settings → Category.
            </p>
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
          {brands.length === 0 && (
            <p className="mt-1.5 text-xs text-gray-500">
              No brands yet. Add them under Settings → Brand.
            </p>
          )}
        </div>
        <div>
          <Label>Price (₹)</Label>
          <Input
            type="number"
            name="price"
            placeholder="0"
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
            placeholder="0"
            value={form.discount}
            onChange={handleChange}
          />
        </div>
        <div className="flex items-end gap-2 pb-2 sm:col-span-2">
          <input
            type="checkbox"
            id="isReturn"
            name="isReturn"
            checked={form.isReturn}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="isReturn">Returnable product</Label>
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
          placeholder="Product description"
          rows={3}
          value={form.description}
          onChange={(val) =>
            setForm((prev) => ({ ...prev, description: val }))
          }
          error={!!errors.description}
          hint={errors.description}
        />
      </div>

      <div>
        <Label>Product Details</Label>
        <TextArea
          placeholder="Additional product details"
          rows={3}
          value={form.productDetails}
          onChange={(val) =>
            setForm((prev) => ({ ...prev, productDetails: val }))
          }
        />
      </div>

      <div>
        <Label>Note</Label>
        <Input
          name="note"
          placeholder="Optional note"
          value={form.note}
          onChange={handleChange}
        />
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
                  placeholder="Size (e.g. M)"
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
          accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
          multiple
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-500/10 dark:file:text-brand-400"
        />
        {errors.images && (
          <p className="mt-1.5 text-xs text-error-500">{errors.images}</p>
        )}
        {images.length > 0 && (
          <p className="mt-2 text-sm text-gray-500">
            {images.length} file(s) selected
          </p>
        )}
        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {images.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <img
                  src={item.preview}
                  alt={item.file.name}
                  className="h-28 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(item.id)}
                  className="absolute right-1 top-1 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label={`Remove ${item.file.name}`}
                >
                  Remove
                </button>
                <p className="truncate px-2 py-1 text-xs text-gray-500">
                  {item.file.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Saving..." : "Add Product"}
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
