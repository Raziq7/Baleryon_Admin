import { useEffect, useMemo, useState } from "react";
import Input from "../input/InputField";
import Button from "../ui/button/Button";
import { useModal } from "../../hooks/useModal";
import Label from "../form/Label";
import { useCatalogStore } from "../../store/catalogStore";
import ComponentCard from "../common/ComponentCard";

export default function AddBrandForm() {
  const { closeModal } = useModal();
  const { addBrand, error } = useCatalogStore();

  const [form, setForm] = useState({ name: "" });
  const [logo, setLogo] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const logoPreview = useMemo(
    () => (logo ? URL.createObjectURL(logo) : null),
    [logo]
  );

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setLogo(file ?? null);
    e.target.value = "";
  };

  const removeLogo = () => setLogo(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
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

    try {
      await addBrand(formData);
      closeModal();
    } catch {
      // error handled in store
    }
  };

  return (
    <ComponentCard title="Add Brand" desc="">
      <form className="flex flex-col" onSubmit={handleSubmit}>
        {error && <p className="mb-4 text-sm text-error-500">{error}</p>}

        <div className="grid grid-cols-1 gap-x-6 gap-y-5">
          <div>
            <Label>Brand Name</Label>
            <Input
              type="text"
              name="name"
              placeholder="e.g. Baleryon"
              value={form.name}
              onChange={handleChange}
              error={!!errors.name}
              hint={errors.name || ""}
            />
          </div>

          <div>
            <Label>Brand Logo (optional)</Label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/gif"
              onChange={handleLogoChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-500/10 dark:file:text-brand-400"
            />
            {logoPreview && (
              <div className="relative mt-3 inline-block">
                <img
                  src={logoPreview}
                  alt="Brand logo preview"
                  className="h-28 w-28 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
                />
                <button
                  type="button"
                  onClick={removeLogo}
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
            Create Brand
          </Button>
        </div>
      </form>
    </ComponentCard>
  );
}
