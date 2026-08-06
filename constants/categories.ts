import type { BaseCategoryId, CategoryId, ExtensionId } from "@/types/game";

export const BASE_CATEGORY_ORDER: BaseCategoryId[] = [
	"military",
	"treasury",
	"wonders",
	"civilians",
	"commercials",
	"scientifics",
	"guilds",
];

export const EXTENSION_ORDER: ExtensionId[] = ["leaders", "cities", "armada"];

export type CategoryMeta = {
	label: string;
	shortLabel: string;
	color: string;
	/** Catégories dont le score est calculé automatiquement à partir d'une saisie détaillée. */
	isComputed: boolean;
};

export const CATEGORY_META: Record<CategoryId, CategoryMeta> = {
	military: { label: "Militaire", shortLabel: "Militaire", color: "#ef4444", isComputed: true },
	treasury: { label: "Trésor", shortLabel: "Trésor", color: "#eab308", isComputed: true },
	wonders: { label: "Merveille", shortLabel: "Merveille", color: "#a8a29e", isComputed: false },
	civilians: {
		label: "Bâtiments civils",
		shortLabel: "Civil",
		color: "#3b82f6",
		isComputed: false,
	},
	commercials: {
		label: "Bâtiments commerciaux",
		shortLabel: "Commerce",
		color: "#f59e0b",
		isComputed: false,
	},
	scientifics: { label: "Science", shortLabel: "Science", color: "#22c55e", isComputed: true },
	guilds: { label: "Guildes", shortLabel: "Guildes", color: "#a855f7", isComputed: false },
	leaders: { label: "Meneurs", shortLabel: "Meneurs", color: "#cbd5e1", isComputed: false },
	cities: { label: "Cités", shortLabel: "Cités", color: "#64748b", isComputed: false },
	armada: { label: "Armada", shortLabel: "Armada", color: "#06b6d4", isComputed: false },
};

export const EXTENSION_LABELS: Record<ExtensionId, string> = {
	leaders: "Meneurs",
	cities: "Cités",
	armada: "Armada",
};
