import { useEffect, useState } from "react";
import Input from "../input/InputField";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import ComponentCard from "../common/ComponentCard";
import SingleImageUploadField from "../common/SingleImageUploadField";
import { useModal } from "../../hooks/useModal";
import { useCatalogStore } from "../../store/catalogStore";

interface EditCategoryFormProps {
  categoryId: string;
}

export default function EditCategoryForm({ categoryId }: EditCategoryFormProps) {
  const { closeModal } = useModal();
  const { getCategoryById, updateCategory, selectedCategory, error } =
    useCatalogStore();

  const [form, setForm] = useState({ name: "" });
  const [image, setImage] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    if (categoryId) getCategoryById(categoryId);
  }, [getCategoryById, categoryId]);

  useEffect(() => {
    if (selectedCategory) {
      setForm({ name: selectedCategory.name || "" });
      setExistingImage(selectedCategory.image ?? null);
      setRemoveExistingImage(false);
    }
  }, [selectedCategory]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
