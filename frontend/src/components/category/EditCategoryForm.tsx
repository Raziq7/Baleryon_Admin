import { useEffect, useState } from "react";
import Input from "../input/InputField";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import ComponentCard from "../common/ComponentCard";
import SingleImageUploadField from "../common/SingleImageUploadField";
import { useModal } from "../../hooks/useModal";
import { useCatalogStore } from "../../store/catalogStore";

const selectClassName =
  "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

interface EditCategoryFormProps {
  categoryId: string;
}

export default function EditCategoryForm({ categoryId }: EditCategoryFormProps) {
  const { closeModal } = useModal();
  const {
    categories,
    getCategoryById,
    updateCategory,
    selectedCategory,
    error,
    fetchCategories,
  } = useCatalogStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const [form, setForm] = useState({ name: "", parentId: "" });
  const [image, setImage] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    if (categoryId) getCategoryById(categoryId);
  }, [getCategoryById, categoryId]);

  useEffect(() => {
    if (selectedCategory) {
      setForm({
        name: selectedCategory.name || "",
        parentId: selectedCategory.parentId || "",
      });
      setExistingImage(selectedCategory.image ?? null);
      setRemoveExistingImage(false);
    }
  }, [selectedCategory]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!form.name.trim()) newErrors.name = "Category name is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("parentId", form.parentId);
    if (image) formData.append("image", image);
    if (removeExistingImage) formData.append("removeImage", "true");

    try {
      await updateCategory(categoryId, formData);
      closeModal();
    } catch {
      // error handled in store
    }
  };

  return (
    <ComponentCard title="Edit Category" desc="">
      <form className="flex flex-col" onSubmit={handleSubmit}>
        {error && (
          <p className="mb-4 text-sm text-error-500">{error}</p>
        )}
        <div className="grid grid-cols-1 gap-6">
          <div>
            <Label>Category Name</Label>
            <Input
              type="text"
              name="name"
              placeholder="Enter category name"
              value={form.name}
              onChange={handleChange}
              error={!!errors.name}
              hint={errors.name || ""}
            />
          </div>

          <div>
            <Label>Parent Category (optional)</Label>
            <select
              name="parentId"
              value={form.parentId}
              onChange={handleChange}
              className={selectClassName}
            >
              <option value="">None (top-level category)</option>
              {categories
                .filter((cat) => cat.id !== categoryId)
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>

          <SingleImageUploadField
            label="Category Image (optional)"
            existingUrl={existingImage}
            newFile={image}
            onFileChange={(file) => {
              setImage(file);
              if (file) setRemoveExistingImage(false);
            }}
            removeExisting={removeExistingImage}
            onRemoveExisting={() => setRemoveExistingImage(true)}
            onClearNew={() => setImage(null)}
          />
        </div>

        <div className="flex items-center gap-3 mt-6 justify-end">
          <Button type="button" size="sm" variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button type="submit" size="sm">
            Update Category
          </Button>
        </div>
      </form>
    </ComponentCard>
  );
}
