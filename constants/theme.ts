import type { TextStyle } from "react-native";

export type ThemeColors = {
	background: string;
	/** Dégradé vertical du fond d'écran (haut → bas), pour la profondeur d'un plateau éclairé. */
	backgroundGradient: readonly [string, string];
	surface: string;
	surfaceAlt: string;
	border: string;
	text: string;
	textMuted: string;
	/** Bronze : boutons, éléments actifs. */
	primary: string;
	/** Texte posé sur `primary` ou `danger`. */
	primaryText: string;
	/** Or : scores, vainqueur, ornements. */
	gold: string;
	danger: string;
	success: string;
};

/** « Nuit d'Alexandrie » : basalte chaud, texte parchemin, bronze et or comme la boîte du jeu. */
export const DARK_COLORS: ThemeColors = {
	background: "#17110b",
	backgroundGradient: ["#271c12", "#110c07"],
	surface: "#241a11",
	surfaceAlt: "#35281b",
	border: "#4d3c28",
	text: "#f3e8d0",
	textMuted: "#b4a283",
	primary: "#c9963b",
	primaryText: "#1a1209",
	gold: "#e3b54a",
	danger: "#d0614a",
	success: "#7fa653",
};

/** « Papyrus » : même mapping sémantique, encre sépia sur papyrus et bronze foncé. */
export const LIGHT_COLORS: ThemeColors = {
	background: "#eee2c6",
	backgroundGradient: ["#f6eedb", "#e6d5b0"],
	surface: "#f9f2e1",
	surfaceAlt: "#e6d7b6",
	border: "#cdb68a",
	text: "#2b1d10",
	textMuted: "#6e5a40",
	primary: "#8a5a1c",
	primaryText: "#fff8e7",
	gold: "#8a5e00",
	danger: "#a8322a",
	success: "#4f7a2a",
};

/** Ivoire et encre, communs aux deux modes, pour écrire sur une couleur vive (catégorie, avatar) :
 * on prend la plus lisible des deux avec `pickReadableText`. */
export const ON_COLOR = {
	light: "#fff8e7",
	dark: "#1a1209",
} as const;

/** Cinzel : capitales romaines gravées, réservées aux titres, boutons et gros chiffres (le texte
 * courant reste en police système, plus lisible en petite taille). Chargées dans `app/_layout`. */
export const FONTS = {
	display: "Cinzel_600SemiBold",
	displayBold: "Cinzel_700Bold",
} as const;

/** Titre d'en-tête (barres de navigation) : Cinzel doré. Pas de `fontWeight` avec une police
 * personnalisée : Android retomberait sur la police système pour chercher la graisse demandée. */
export function headerTitleStyle(colors: ThemeColors): TextStyle {
	return { fontFamily: FONTS.displayBold, color: colors.gold, fontSize: 19 };
}

/** Fond de carte commun : surface cerclée d'un filet, comme une tablette gravée. */
export function cardSurface(colors: ThemeColors) {
	return {
		backgroundColor: colors.surface,
		borderWidth: 1,
		borderColor: colors.border,
	} as const;
}

export const RADIUS = {
	sm: 6,
	md: 10,
	lg: 18,
	full: 999,
} as const;

export const SPACING = {
	xs: 4,
	sm: 8,
	md: 16,
	lg: 24,
	xl: 32,
} as const;
