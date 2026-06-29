import { useEffect, useMemo, useState } from "react";
import Input from "../input/InputField";
import Button from "../ui/button/Button";
import { useModal } from "../../hooks/useModal";
import Label from "../form/Label";
import { useCatalogStore } from "../../store/catalogStore";
import ComponentCard from "../common/ComponentCard";

export default function AddCategoryForm() {
  const { closeModal } = useModal();
  const { addCategory, error } = useCatalogStore();

  const [form, setForm] = useState({ name: "" });
  const [image, setImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const imagePreview = useMemo(
    () => (image ? URL.createObjectURL(image) : null),
    [image]
  );

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImage(file ?? null);
    e.target.value = "";
  };

  const removeImage = () => setImage(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Category name is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    formData.append("name", form.name.trim());
    if (image) formData.append("image", image);

    try {
      await addCategory(formData);
      closeModal();
    } catch {
      // error handled in store
    }
  };

  return (
    <ComponentCard title="Add Category" desc="">
      <form className="flex flex-col" onSubmit={handleSubmit}>
        {error && (
          <p className="mb-4 text-sm text-error-500">{error}</p>
        )}

        <div className="grid grid-cols-1 gap-x-6 gap-y-5">
          <div>
            <Label>Category Name</Label>
            <Input
              type="text"
              name="name"
              placeholder="e.g. T-Shirts"
              value={form.name}
              onChange={handleChange}
              error={!!errors.name}
              hint={errors.name || ""}
            />
          </div>

          <div>
            <Label>Category Image (optional)</Label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/gif"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-500/10 dark:file:text-brand-400"
            />
            {imagePreview && (
              <div className="relative mt-3 inline-block">
                <img
                  src={imagePreview}
                  alt="Category preview"
                  className="h-28 w-28 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -right-2 -top-2 rounded-full bg-gray-800 px-2 py-0.5 text-xs text-white"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 px-2 mt-6 justify-end">
          <Button type="button" size="sm" variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button type="submit" size="sm">
            Create Category
          </Button>
        </div>
      </form>
    </ComponentCard>
  );
}
