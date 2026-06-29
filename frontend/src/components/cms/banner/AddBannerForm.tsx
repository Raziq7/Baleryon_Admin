import { useEffect, useMemo, useState } from "react";
import Input from "../../input/InputField";
import TextArea from "../../input/TextArea";
import Button from "../../ui/button/Button";
import Label from "../../form/Label";
import ComponentCard from "../../common/ComponentCard";
import { useCmsStore } from "../../../store/cmsStore";

type Props = { onClose: () => void };

export default function AddBannerForm({ onClose }: Props) {
  const { addBanner, error } = useCmsStore();
  const [form, setForm] = useState({
    topContent: "",
    mainContent: "",
    lastContent: "",
    shopNowLink: "",
  });
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v.trim()));
    if (image) formData.append("image", image);

    try {
      await addBanner(formData);
      onClose();
    } catch {
      /* store handles error */
    }
  };

  return (
    <ComponentCard title="Add Banner" desc="">
      <form className="flex flex-col" onSubmit={handleSubmit}>
        {error && <p className="mb-4 text-sm text-error-500">{error}</p>}
        <div className="grid grid-cols-1 gap-5">
          <div>
            <Label>Banner Image</Label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-2 h-24 w-24 rounded-lg object-cover"
              />
            )}
          </div>
          <div>
            <Label>Top Content</Label>
            <TextArea
              value={form.topContent}
              onChange={(v) => setForm((p) => ({ ...p, topContent: v }))}
              rows={2}
            />
          </div>
          <div>
            <Label>Main Content</Label>
            <TextArea
              value={form.mainContent}
              onChange={(v) => setForm((p) => ({ ...p, mainContent: v }))}
              rows={3}
            />
          </div>
          <div>
            <Label>Last Content</Label>
            <TextArea
              value={form.lastContent}
              onChange={(v) => setForm((p) => ({ ...p, lastContent: v }))}
              rows={2}
            />
          </div>
          <div>
            <Label>Shop Now Link / ID</Label>
            <Input
              type="text"
              name="shopNowLink"
              placeholder="/products/123 or https://..."
              value={form.shopNowLink}
              onChange={handleChange}
              error={!!errors.shopNowLink}
              hint={errors.shopNowLink || ""}
            />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-6 justify-end">
          <Button type="button" size="sm" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm">
            Create Banner
          </Button>
        </div>
      </form>
    </ComponentCard>
  );
}
