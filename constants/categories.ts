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

/** Sous-ensemble de `CategoryId` qui n'existe que grâce à une extension (donc "réinitialisable"
 * quand celle-ci est désactivée), par opposition aux 7 catégories de base toujours présentes. */
export type ExtensionCategoryId = "leaders" | "cities" | "armada" | "islands";

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
		color: "#f43f5e",
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
		// Cartes Îles + bonus du plateau individuel Armada : catégorie interne toujours nommée
		// "islands" (pas de migration de données pour un simple libellé), mais affichée "Armada" —
		// le jeu ne distingue pas "îles" du reste du score de plateau, la case jetons s'appelant déjà
		// "Maritime" pour le conflit naval.
		label: "Armada",
		shortLabel: "Armada",
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

/** Catégories de score qu'une extension seule/qu'elle seule apporte, dans l'esprit de
 * `getOrderedCategories` : Armada apporte deux catégories ("armada" les jetons de conflit naval,
 * "islands" le score de plateau), pas une seule comme Leaders/Cités. Sert à la fois à décrire
 * l'impact d'activer/désactiver une extension (écran de modification en cours de partie) et à
 * savoir quels champs de saisie remettre à zéro quand une extension est retirée. */
export const EXTENSION_CATEGORIES: Record<ExtensionId, ExtensionCategoryId[]> = {
	leaders: ["leaders"],
	cities: ["cities"],
	armada: ["armada", "islands"],
};

/**
 * Toutes les catégories de score actives pour une partie, dans l'ordre d'affichage/de saisie.
 * Les 7 catégories de base sont toujours présentes, avec "Maritime" (jetons de conflit naval)
 * inséré juste après "Militaire" quand Armada est active — pas à la fin avec les autres
 * extensions, puisqu'on compte ses jetons dans la foulée du militaire au moment d'y jouer. Les
 * autres extensions s'ajoutent à la suite, et le score de plateau Armada ("islands", affiché
 * "Armada") ferme la marche.
 */
export function getOrderedCategories(extensions: ExtensionId[]): CategoryId[] {
	const categories: CategoryId[] = [];
	for (const category of BASE_CATEGORY_ORDER) {
		categories.push(category);
		if (category === "military" && extensions.includes("armada")) {
			categories.push("armada");
		}
	}
	if (extensions.includes("leaders")) categories.push("leaders");
	if (extensions.includes("cities")) categories.push("cities");
	if (extensions.includes("armada")) categories.push("islands");
	return categories;
}
