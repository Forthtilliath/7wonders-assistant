import type { MaterialCommunityIcons } from "@expo/vector-icons";
import type { BaseCategoryId, CategoryId, ExtensionId } from "@/types/game";

type MaterialCommunityIconName = keyof typeof MaterialCommunityIcons.glyphMap;

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
	/** Glyphe MaterialCommunityIcons illustrant la catégorie, pour la repérer plus vite qu'avec un
	 * simple point de couleur (graphiques, tableau croisé, écran de saisie). */
	icon: MaterialCommunityIconName;
};

export const CATEGORY_META: Record<CategoryId, CategoryMeta> = {
	military: {
		label: "Militaire",
		shortLabel: "Militaire",
		color: "#ef4444",
		isComputed: false,
		icon: "sword",
	},
	treasury: {
		label: "Trésor",
		shortLabel: "Trésor",
		color: "#eab308",
		isComputed: false,
		icon: "cash-multiple",
	},
	wonders: {
		label: "Merveille",
		shortLabel: "Merveille",
		color: "#a8a29e",
		isComputed: false,
		icon: "castle",
	},
	civilians: {
		label: "Bâtiments civils",
		shortLabel: "Civil",
		color: "#3b82f6",
		isComputed: false,
		icon: "office-building",
	},
	commercials: {
		label: "Bâtiments commerciaux",
		shortLabel: "Commerce",
		color: "#f59e0b",
		isComputed: false,
		icon: "storefront",
	},
	scientifics: {
		label: "Science",
		shortLabel: "Science",
		color: "#22c55e",
		isComputed: true,
		icon: "flask",
	},
	guilds: {
		label: "Guildes",
		shortLabel: "Guildes",
		color: "#a855f7",
		isComputed: false,
		icon: "handshake",
	},
	leaders: {
		label: "Leaders",
		shortLabel: "Leaders",
		color: "#cbd5e1",
		isComputed: false,
		icon: "crown",
	},
	cities: {
		label: "Cités",
		shortLabel: "Cités",
		color: "#64748b",
		isComputed: false,
		icon: "city",
	},
	armada: {
		label: "Maritime",
		shortLabel: "Maritime",
		color: "#06b6d4",
		isComputed: false,
		icon: "sail-boat",
	},
	islands: {
		label: "Îles & Plateau Armada",
		shortLabel: "Îles",
		color: "#0891b2",
		isComputed: false,
		icon: "island",
	},
};

export const EXTENSION_LABELS: Record<ExtensionId, string> = {
	leaders: "Leaders",
	cities: "Cités",
	armada: "Armada",
};

/**
 * Catégories de score apportées par chaque extension. La plupart n'en apportent qu'une (elles-
 * mêmes), mais Armada en apporte deux : les jetons maritimes (catégorie `armada`) et les cartes
 * Îles + plateau individuel (catégorie `islands`).
 */
export const EXTENSION_CATEGORIES: Record<ExtensionId, CategoryId[]> = {
	leaders: ["leaders"],
	cities: ["cities"],
	armada: ["armada", "islands"],
};

/** Catégories de score apportées par un ensemble d'extensions actives, dans l'ordre. */
export function getExtensionCategories(extensions: ExtensionId[]): CategoryId[] {
	return EXTENSION_ORDER.filter((ext) => extensions.includes(ext)).flatMap(
		(ext) => EXTENSION_CATEGORIES[ext],
	);
}
