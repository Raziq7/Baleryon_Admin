import { useMemo } from "react";
import Label from "../form/Label";

type Props = {
  label: string;
  existingUrl?: string | null;
  newFile: File | null;
  onFileChange: (file: File | null) => void;
  removeExisting: boolean;
  onRemoveExisting: () => void;
  onClearNew: () => void;
  accept?: string;
};

export default function SingleImageUploadField({
  label,
  existingUrl,
  newFile,
  onFileChange,
  removeExisting,
  onRemoveExisting,
  onClearNew,
  accept = "image/png,image/jpeg,image/jpg,image/gif,image/webp",
}: Props) {
  const newPreview = useMemo(
    () => (newFile ? URL.createObjectURL(newFile) : null),
    [newFile]
  );

  const displayUrl =
    newPreview || (!removeExisting && existingUrl ? existingUrl : null);

  return (
    <div>
      <Label>{label}</Label>
      <input
        type="file"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          onFileChange(file);
          e.target.value = "";
        }}
        className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-500/10 dark:file:text-brand-400"
      />
      {displayUrl && (
        <div className="relative mt-3 inline-block">
          <img
            src={displayUrl}
            alt="Preview"
            className="h-28 w-28 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {newFile && (
              <button
                type="button"
                onClick={onClearNew}
                className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-white"
              >
                Cancel new image
              </button>
            )}
            {!newFile && existingUrl && !removeExisting && (
              <button
                type="button"
                onClick={onRemoveExisting}
                className="rounded-full border border-error-300 px-2 py-0.5 text-xs text-error-600"
              >
                Remove image
              </button>
            )}
            {removeExisting && !newFile && (
              <span className="text-xs text-amber-600">
                Image will be removed on save
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
