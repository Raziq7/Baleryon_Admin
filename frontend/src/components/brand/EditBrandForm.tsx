import { useEffect, useState } from "react";
import Input from "../input/InputField";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import ComponentCard from "../common/ComponentCard";
import SingleImageUploadField from "../common/SingleImageUploadField";
import { useModal } from "../../hooks/useModal";
import { useCatalogStore } from "../../store/catalogStore";

interface EditBrandFormProps {
  brandId: string;
}

export default function EditBrandForm({ brandId }: EditBrandFormProps) {
  const { closeModal } = useModal();
  const { getBrandById, updateBrand, selectedBrand, error } = useCatalogStore();

  const [form, setForm] = useState({ name: "" });
  const [logo, setLogo] = useState<File | null>(null);
  const [existingLogo, setExistingLogo] = useState<string | null>(null);
  const [removeExistingLogo, setRemoveExistingLogo] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    if (brandId) getBrandById(brandId);
  }, [getBrandById, brandId]);

  useEffect(() => {
    if (selectedBrand) {
      setForm({ name: selectedBrand.name || "" });
      setExistingLogo(selectedBrand.logo ?? null);
      setRemoveExistingLogo(false);
    }
  }, [selectedBrand]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!form.name.trim()) newErrors.name = "Brand name is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    formData.append("name", form.name.trim());
    if (logo) formData.append("logo", logo);
    if (removeExistingLogo) formData.append("removeImage", "true");

    try {
      await updateBrand(brandId, formData);
      closeModal();
    } catch {
      // error handled in store
    }
  };

  return (
    <ComponentCard title="Edit Brand" desc="">
      <form className="flex flex-col" onSubmit={handleSubmit}>
        {error && <p className="mb-4 text-sm text-error-500">{error}</p>}
        <div className="grid grid-cols-1 gap-6">
          <div>
            <Label>Brand Name</Label>
            <Input
              type="text"
              name="name"
              placeholder="Enter brand name"
              value={form.name}
              onChange={handleChange}
              error={!!errors.name}
              hint={errors.name || ""}
            />
          </div>

          <SingleImageUploadField
            label="Brand Logo (optional)"
            existingUrl={existingLogo}
            newFile={logo}
            onFileChange={(file) => {
              setLogo(file);
              if (file) setRemoveExistingLogo(false);
            }}
            removeExisting={removeExistingLogo}
            onRemoveExisting={() => setRemoveExistingLogo(true)}
            onClearNew={() => setLogo(null)}
          />
        </div>

        <div className="flex items-center gap-3 mt-6 justify-end">
          <Button type="button" size="sm" variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button type="submit" size="sm">
            Update Brand
          </Button>
        </div>
      </form>
    </ComponentCard>
  );
}
