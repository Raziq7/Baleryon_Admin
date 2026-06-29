import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import Label from "../form/Label";
import Input from "../input/InputField";
import Button from "../ui/button/Button";
import {
  normalizeHex,
  PRESET_COLORS,
  type ProductColorOption,
} from "../../constants/productColors.ts";

export type SelectedColor = ProductColorOption & { id: string };

type ColorMultiSelectProps = {
  value: SelectedColor[];
  onChange: (colors: SelectedColor[]) => void;
  error?: string;
};

export default function ColorMultiSelect({
  value,
  onChange,
  error,
}: ColorMultiSelectProps) {
  const [pickerHex, setPickerHex] = useState("#3B82F6");
  const [colorName, setColorName] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const addColor = (name: string, hex: string) => {
    const normalizedHex = normalizeHex(hex);
    const trimmedName = name.trim() || normalizedHex;

    const duplicate = value.some(
      (c) =>
        c.name.toLowerCase() === trimmedName.toLowerCase() ||
        c.hex.toLowerCase() === normalizedHex.toLowerCase()
    );
    if (duplicate) return;

    onChange([
      ...value,
      { id: crypto.randomUUID(), name: trimmedName, hex: normalizedHex },
    ]);
    setColorName("");
  };

  const removeColor = (id: string) => {
    onChange(value.filter((c) => c.id !== id));
  };

  const handleAddCustom = () => {
    addColor(colorName, pickerHex);
    setShowPicker(false);
  };

  const handlePresetClick = (preset: ProductColorOption) => {
    addColor(preset.name, preset.hex);
  };

  return (
    <div className="space-y-3">
      <Label>Colors</Label>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((color) => (
            <div
              key={color.id}
              className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 py-1 pl-1.5 pr-2 dark:border-gray-700 dark:bg-gray-800"
            >
              <span
                className="h-6 w-6 shrink-0 rounded-full border border-gray-300 dark:border-gray-600"
                style={{ backgroundColor: color.hex }}
                title={color.hex}
              />
              <span className="text-sm text-gray-800 dark:text-white/90">
                {color.name}
              </span>
              <button
                type="button"
                onClick={() => removeColor(color.id)}
                className="ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label={`Remove ${color.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div>
        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
          Quick pick
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((preset) => {
            const selected = value.some(
              (c) => c.hex.toLowerCase() === preset.hex.toLowerCase()
            );
            return (
              <button
                key={preset.hex}
                type="button"
                title={preset.name}
                disabled={selected}
                onClick={() => handlePresetClick(preset)}
                className="h-8 w-8 rounded-full border-2 border-gray-200 transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600"
                style={{ backgroundColor: preset.hex }}
              />
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Custom color
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setShowPicker((prev) => !prev)}
          >
            {showPicker ? "Hide picker" : "Pick color"}
          </Button>
        </div>

        {showPicker && (
          <div className="mb-3 flex flex-col items-start gap-3 sm:flex-row">
            <HexColorPicker
              color={pickerHex}
              onChange={setPickerHex}
              style={{ width: "100%", maxWidth: 200, height: 160 }}
            />
            <div className="flex items-center gap-2">
              <span
                className="h-10 w-10 rounded-lg border border-gray-300 dark:border-gray-600"
                style={{ backgroundColor: pickerHex }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {normalizeHex(pickerHex)}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[160px] flex-1">
            <Input
              placeholder="Color name (optional)"
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
            />
          </div>
          <Button
            type="button"
            size="sm"
            variant="primary"
            onClick={handleAddCustom}
          >
            Add color
          </Button>
        </div>
      </div>

      {error && <p className="text-xs text-error-500">{error}</p>}
    </div>
  );
}
