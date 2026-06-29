import { useEffect, useMemo, useState } from "react";
import Input from "../../input/InputField";
import TextArea from "../../input/TextArea";
import Button from "../../ui/button/Button";
import Label from "../../form/Label";
import ComponentCard from "../../common/ComponentCard";
import { useCmsStore } from "../../../store/cmsStore";

type Props = { onClose: () => void };

export default function AddLimitedSeasonForm({ onClose }: Props) {
  const { addLimitedSeason, error } = useCmsStore();
  const [form, setForm] = useState({
    mainContent: "",
    description: "",
    timeCountingHours: "3",
    ctaLink: "",
  });
  const [bgImage, setBgImage] = useState<File | null>(null);

  const preview = useMemo(
    () => (bgImage ? URL.createObjectURL(bgImage) : null),
    [bgImage]
  );

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("mainContent", form.mainContent.trim());
    formData.append("description", form.description.trim());
    formData.append("timeCountingHours", form.timeCountingHours);
    formData.append("ctaLink", form.ctaLink.trim());
    if (bgImage) formData.append("backgroundImage", bgImage);

    try {
      await addLimitedSeason(formData);
      onClose();
    } catch {
      /* store */
    }
  };

  return (
    <ComponentCard title="Add Limited Season" desc="">
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        {error && <p className="text-sm text-error-500">{error}</p>}
        <div>
          <Label>Background Image</Label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setBgImage(e.target.files?.[0] ?? null)}
            className="block w-full text-sm"
          />
          {preview && (
            <img src={preview} alt="" className="mt-2 h-24 w-40 rounded-lg object-cover" />
          )}
        </div>
        <div>
          <Label>Main Content</Label>
          <TextArea
            value={form.mainContent}
            onChange={(v) => setForm((p) => ({ ...p, mainContent: v }))}
          />
        </div>
        <div>
          <Label>Description</Label>
          <TextArea
            value={form.description}
            onChange={(v) => setForm((p) => ({ ...p, description: v }))}
            rows={3}
          />
        </div>
        <div>
          <Label>Time Counting (hours)</Label>
          <Input
            type="number"
            name="timeCountingHours"
            value={form.timeCountingHours}
            onChange={(e) =>
              setForm((p) => ({ ...p, timeCountingHours: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>CTA Link / ID</Label>
          <Input
            type="text"
            name="ctaLink"
            value={form.ctaLink}
            onChange={(e) => setForm((p) => ({ ...p, ctaLink: e.target.value }))}
          />
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
