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

export const EXTENSION_ORDER: ExtensionId[] = ["leaders", "cities", "babel", "armada", "edifice"];

/** Sous-ensemble de `CategoryId` qui n'existe que grâce à une extension (donc "réinitialisable"
 * quand celle-ci est désactivée), par opposition aux 7 catégories de base toujours présentes. */
export type ExtensionCategoryId = "leaders" | "cities" | "babel" | "naval" | "armada";

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

// Couleurs reprises des cartes du jeu (rouge militaire, bleu civil, vert science, violet guildes,
// blanc Leaders, noir Cities…), patinées pour rester lisibles sur papyrus comme sur basalte.
export const CATEGORY_META: Record<CategoryId, CategoryMeta> = {
	military: {
		label: "Militaire",
		shortLabel: "Militaire",
		color: "#c0392b",
		isComputed: false,
		icon: "sword",
	},
	treasury: {
		label: "Trésor",
		shortLabel: "Trésor",
		color: "#d9ad38",
		isComputed: false,
		icon: "cash-multiple",
	},
	wonders: {
		label: "Merveille",
		shortLabel: "Merveille",
		color: "#a8875e",
		isComputed: false,
		icon: "castle",
	},
	civilians: {
		label: "Bâtiments civils",
		shortLabel: "Civil",
		color: "#2f6db5",
		isComputed: false,
		icon: "office-building",
	},
	commercials: {
		label: "Bâtiments commerciaux",
		shortLabel: "Commerce",
		color: "#e3872d",
		isComputed: false,
		icon: "storefront",
	},
	scientifics: {
		label: "Science",
		shortLabel: "Science",
		color: "#3e8e41",
		isComputed: true,
		icon: "flask",
	},
	guilds: {
		label: "Guildes",
		shortLabel: "Guildes",
		color: "#7d4a9e",
		isComputed: false,
		icon: "handshake",
	},
	leaders: {
		label: "Leaders",
		shortLabel: "Leaders",
		color: "#b9ab86",
		isComputed: false,
		icon: "crown",
	},
	cities: {
		label: "Cities",
		shortLabel: "Cities",
		color: "#6e6660",
		isComputed: false,
		icon: "city",
	},
	// Tuiles Babel posées sur la tour (barème fixe selon leur nombre).
	babel: {
		label: "Babel",
		shortLabel: "Babel",
		color: "#9a5b3f",
		isComputed: true,
		icon: "pyramid",
	},
	// Jetons de conflit naval de l'extension Armada.
	naval: {
		label: "Maritime",
		shortLabel: "Maritime",
		color: "#1c8aa6",
		isComputed: false,
		icon: "sail-boat",
	},
	// Plateau individuel Armada + cartes Îles (le jeu ne les distingue pas dans le score).
	armada: {
		label: "Armada",
		shortLabel: "Armada",
		color: "#4fae9b",
		isComputed: false,
		icon: "island",
	},
};

export const EXTENSION_LABELS: Record<ExtensionId, string> = {
	leaders: "Leaders",
	cities: "Cities",
	babel: "Babel",
	edifice: "Edifice",
	armada: "Armada",
};

/** Catégories de score qu'une extension seule/qu'elle seule apporte, dans l'esprit de
 * `getOrderedCategories` : Armada apporte deux catégories ("naval" les jetons de conflit naval,
 * "armada" le plateau + les Îles), pas une seule comme Leaders/Cities. Sert à la fois à décrire
 * l'impact d'activer/désactiver une extension (écran de modification en cours de partie) et à
 * savoir quels champs de saisie remettre à zéro quand une extension est retirée. */
export const EXTENSION_CATEGORIES: Record<ExtensionId, ExtensionCategoryId[]> = {
	leaders: ["leaders"],
	cities: ["cities"],
	babel: ["babel"],
	// Aucune étape de score : pions Participation et jetons Dette d'Edifice se comptent avec le trésor.
	edifice: [],
	armada: ["naval", "armada"],
};

/**
 * Toutes les catégories de score actives pour une partie, dans l'ordre d'affichage/de saisie.
 * Les 7 catégories de base sont toujours présentes, avec "Maritime" (jetons de conflit naval)
 * inséré juste après "Militaire" quand Armada est active — pas à la fin avec les autres
 * extensions, puisqu'on compte ses jetons dans la foulée du militaire au moment d'y jouer. Les
 * autres extensions s'ajoutent à la suite (Leaders, Cities puis Babel), et le plateau Armada + Îles
 * ("armada") ferme la marche.
 */
export function getOrderedCategories(extensions: ExtensionId[]): CategoryId[] {
	const categories: CategoryId[] = [];
	for (const category of BASE_CATEGORY_ORDER) {
		categories.push(category);
		if (category === "military" && extensions.includes("armada")) {
			categories.push("naval");
		}
	}
	if (extensions.includes("leaders")) categories.push("leaders");
	if (extensions.includes("cities")) categories.push("cities");
	if (extensions.includes("babel")) categories.push("babel");
	if (extensions.includes("armada")) categories.push("armada");
	return categories;
}
