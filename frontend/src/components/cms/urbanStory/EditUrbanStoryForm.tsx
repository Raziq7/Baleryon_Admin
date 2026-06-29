import { useEffect, useState } from "react";
import Input from "../../input/InputField";
import Button from "../../ui/button/Button";
import Label from "../../form/Label";
import ComponentCard from "../../common/ComponentCard";
import SingleImageUploadField from "../../common/SingleImageUploadField";
import { useCmsStore } from "../../../store/cmsStore";

type Props = { itemId: string; onClose: () => void };

export default function EditUrbanStoryForm({ itemId, onClose }: Props) {
  const { getUrbanStoryById, updateUrbanStory, selectedUrbanStory, error } =
    useCmsStore();
  const [category, setCategory] = useState("");
  const [ctaLink, setCtaLink] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);

  useEffect(() => {
    getUrbanStoryById(itemId);
  }, [itemId, getUrbanStoryById]);

  useEffect(() => {
    if (selectedUrbanStory) {
      setCategory(selectedUrbanStory.category);
      setCtaLink(selectedUrbanStory.ctaLink || "");
      setExistingImage(selectedUrbanStory.imageUrl ?? null);
      setRemoveExistingImage(false);
    }
  }, [selectedUrbanStory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("category", category.trim());
    formData.append("ctaLink", ctaLink.trim());
    if (image) formData.append("image", image);
    if (removeExistingImage) formData.append("removeImage", "true");

    try {
      await updateUrbanStory(itemId, formData);
      onClose();
    } catch {
      /* store */
    }
  };

  return (
    <ComponentCard title="Edit Urban Story" desc="">
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        {error && <p className="text-sm text-error-500">{error}</p>}
        <div>
          <Label>Category</Label>
          <Input type="text" value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>
        <div>
          <Label>CTA Link / ID</Label>
          <Input type="text" value={ctaLink} onChange={(e) => setCtaLink(e.target.value)} />
        </div>
        <SingleImageUploadField
          label="Image"
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
