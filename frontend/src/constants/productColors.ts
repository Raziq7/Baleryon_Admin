export type ProductColorOption = {
  name: string;
  hex: string;
};

export const PRESET_COLORS: ProductColorOption[] = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Red", hex: "#EF4444" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Green", hex: "#22C55E" },
  { name: "Yellow", hex: "#EAB308" },
  { name: "Orange", hex: "#F97316" },
  { name: "Purple", hex: "#A855F7" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Gray", hex: "#6B7280" },
  { name: "Navy", hex: "#1E3A5F" },
  { name: "Brown", hex: "#92400E" },
];

const COLOR_NAME_HEX: Record<string, string> = Object.fromEntries(
  PRESET_COLORS.map(({ name, hex }) => [name.toLowerCase(), hex])
);

export function getColorHex(colorName: string, fallbackHex?: string): string {
  if (fallbackHex && /^#[0-9A-Fa-f]{6}$/.test(fallbackHex)) {
    return fallbackHex;
  }
  if (/^#[0-9A-Fa-f]{6}$/.test(colorName)) {
    return colorName;
  }
  return COLOR_NAME_HEX[colorName.toLowerCase()] || "#9CA3AF";
}

export function normalizeHex(hex: string): string {
  const value = hex.startsWith("#") ? hex : `#${hex}`;
  if (/^#[0-9A-Fa-f]{6}$/.test(value)) return value.toUpperCase();
  if (/^#[0-9A-Fa-f]{3}$/.test(value)) {
    const [, r, g, b] = value;
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return "#000000";
}
