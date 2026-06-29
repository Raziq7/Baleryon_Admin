import { useEffect, useState } from "react";
import Input from "../../input/InputField";
import TextArea from "../../input/TextArea";
import Button from "../../ui/button/Button";
import Label from "../../form/Label";
import ComponentCard from "../../common/ComponentCard";
import SingleImageUploadField from "../../common/SingleImageUploadField";
import { useCmsStore } from "../../../store/cmsStore";

type Props = { bannerId: string; onClose: () => void };

export default function EditBannerForm({ bannerId, onClose }: Props) {
  const { getBannerById, updateBanner, selectedBanner, error } = useCmsStore();
  const [form, setForm] = useState({
    topContent: "",
    mainContent: "",
    lastContent: "",
    shopNowLink: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);

  useEffect(() => {
    getBannerById(bannerId);
  }, [bannerId, getBannerById]);

  useEffect(() => {
    if (selectedBanner) {
      setForm({
        topContent: selectedBanner.topContent || "",
        mainContent: selectedBanner.mainContent || "",
        lastContent: selectedBanner.lastContent || "",
        shopNowLink: selectedBanner.shopNowLink || "",
      });
      setExistingImage(selectedBanner.imageUrl ?? null);
      setRemoveExistingImage(false);
    }
  }, [selectedBanner]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v.trim()));
    if (image) formData.append("image", image);
    if (removeExistingImage) formData.append("removeImage", "true");

    try {
      await updateBanner(bannerId, formData);
      onClose();
    } catch {
      /* store */
    }
  };

  return (
    <ComponentCard title="Edit Banner" desc="">
      <form className="flex flex-col" onSubmit={handleSubmit}>
        {error && <p className="mb-4 text-sm text-error-500">{error}</p>}
        <div className="grid grid-cols-1 gap-5">
          <SingleImageUploadField
            label="Banner Image"
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
              value={form.shopNowLink}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-6 justify-end">
          <Button type="button" size="sm" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm">
            Update Banner
          </Button>
        </div>
      </form>
    </ComponentCard>
  );
}
