import { useEffect, useMemo, useState } from "react";
import Input from "../../input/InputField";
import Button from "../../ui/button/Button";
import Label from "../../form/Label";
import ComponentCard from "../../common/ComponentCard";
import { useCmsStore } from "../../../store/cmsStore";

const CATEGORY_SUGGESTIONS = [
  "Street Wear",
  "Street Culture",
  "Urban Lifestyle",
  "Night Life",
];

type Props = { onClose: () => void };

export default function AddUrbanStoryForm({ onClose }: Props) {
  const { addUrbanStory, error } = useCmsStore();
  const [category, setCategory] = useState("");
  const [ctaLink, setCtaLink] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const preview = useMemo(
    () => (image ? URL.createObjectURL(image) : null),
    [image]
  );

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category.trim()) {
      setErrors({ category: "Category is required" });
      return;
    }
    const formData = new FormData();
    formData.append("category", category.trim());
    formData.append("ctaLink", ctaLink.trim());
    if (image) formData.append("image", image);

    try {
      await addUrbanStory(formData);
      onClose();
    } catch {
      /* store */
    }
  };

  return (
    <ComponentCard title="Add Urban Story" desc="">
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        {error && <p className="text-sm text-error-500">{error}</p>}
        <div>
          <Label>Category</Label>
          <Input
            type="text"
            name="category"
            placeholder="e.g. Street Wear"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            error={!!errors.category}
            hint={errors.category || ""}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {CATEGORY_SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setCategory(s)}
                className="rounded-full border border-gray-200 px-2 py-0.5 text-xs dark:border-gray-700"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label>CTA Link / ID</Label>
          <Input type="text" value={ctaLink} onChange={(e) => setCtaLink(e.target.value)} />
        </div>
        <div>
          <Label>Image</Label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            className="block w-full text-sm"
          />
          {preview && (
            <img src={preview} alt="" className="mt-2 h-24 w-24 rounded-lg object-cover" />
          )}
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" size="sm" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm">
            Create
          </Button>
        </div>
      </form>
    </ComponentCard>
  );
}
