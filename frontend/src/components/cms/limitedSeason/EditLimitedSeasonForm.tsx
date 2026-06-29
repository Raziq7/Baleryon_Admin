import { useEffect, useState } from "react";
import Input from "../../input/InputField";
import TextArea from "../../input/TextArea";
import Button from "../../ui/button/Button";
import Label from "../../form/Label";
import ComponentCard from "../../common/ComponentCard";
import SingleImageUploadField from "../../common/SingleImageUploadField";
import { useCmsStore } from "../../../store/cmsStore";

type Props = { itemId: string; onClose: () => void };

export default function EditLimitedSeasonForm({ itemId, onClose }: Props) {
  const { getLimitedSeasonById, updateLimitedSeason, selectedLimitedSeason, error } =
    useCmsStore();
  const [form, setForm] = useState({
    mainContent: "",
    description: "",
    timeCountingHours: "3",
    ctaLink: "",
  });
  const [bgImage, setBgImage] = useState<File | null>(null);
  const [existingBg, setExistingBg] = useState<string | null>(null);
  const [removeExistingBg, setRemoveExistingBg] = useState(false);

  useEffect(() => {
    getLimitedSeasonById(itemId);
  }, [itemId, getLimitedSeasonById]);

  useEffect(() => {
    if (selectedLimitedSeason) {
      setForm({
        mainContent: selectedLimitedSeason.mainContent || "",
        description: selectedLimitedSeason.description || "",
        timeCountingHours: String(selectedLimitedSeason.timeCountingHours),
        ctaLink: selectedLimitedSeason.ctaLink || "",
      });
      setExistingBg(selectedLimitedSeason.backgroundImageUrl ?? null);
      setRemoveExistingBg(false);
    }
  }, [selectedLimitedSeason]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("mainContent", form.mainContent.trim());
    formData.append("description", form.description.trim());
    formData.append("timeCountingHours", form.timeCountingHours);
    formData.append("ctaLink", form.ctaLink.trim());
    if (bgImage) formData.append("backgroundImage", bgImage);
    if (removeExistingBg) formData.append("removeImage", "true");

    try {
      await updateLimitedSeason(itemId, formData);
      onClose();
    } catch {
      /* store */
    }
  };

  return (
    <ComponentCard title="Edit Limited Season" desc="">
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        {error && <p className="text-sm text-error-500">{error}</p>}
        <SingleImageUploadField
          label="Background Image"
          existingUrl={existingBg}
          newFile={bgImage}
          onFileChange={(file) => {
            setBgImage(file);
            if (file) setRemoveExistingBg(false);
          }}
          removeExisting={removeExistingBg}
          onRemoveExisting={() => setRemoveExistingBg(true)}
          onClearNew={() => setBgImage(null)}
        />
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
            Update
          </Button>
        </div>
      </form>
    </ComponentCard>
  );
}
