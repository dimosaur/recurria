import Ionicons from "@expo/vector-icons/Ionicons";
import { ComponentProps } from "react";

export type CategoryMeta = {
  icon: ComponentProps<typeof Ionicons>["name"];
  bg: string;
};

const CATEGORY_META: Record<string, CategoryMeta> = {
  music: { icon: "musical-notes-outline", bg: "#7D5FFF" },
  storage: { icon: "cloud-outline", bg: "#2D98DA" },
  video: { icon: "tv-outline", bg: "#EB3B5A" },
  dev: { icon: "code-slash-outline", bg: "#26DE81" },
  design: { icon: "color-palette-outline", bg: "#F7B731" },
  web: { icon: "globe-outline", bg: "#45AAF2" },
  cloud: { icon: "server-outline", bg: "#20BF6B" },
  health: { icon: "heart-outline", bg: "#FC5C65" },
  productivity: { icon: "document-text-outline", bg: "#A55EEA" },
  gaming: { icon: "game-controller-outline", bg: "#8854D0" },
  auto: { icon: "car-outline", bg: "#778CA3" },
  default: { icon: "card-outline", bg: "#9BA1A6" },
};

export function getCategoryMeta(category?: string | null): CategoryMeta {
  if (!category) return CATEGORY_META.default;
  return CATEGORY_META[category] ?? CATEGORY_META.default;
}
