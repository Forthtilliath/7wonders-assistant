import type { ImageSource } from "expo-image";
import type { ExtensionId, GameEdition } from "@/types/game";

/** Couverture d'une boîte : image et proportions (largeur ÷ hauteur), pour réserver sa place avant
 * le chargement. `null` sans visuel disponible : la boîte s'affiche alors avec son seul nom. */
export type BoxCover = { source: ImageSource; aspectRatio: number } | null;

/**
 * Rendus 3D des boîtes, retaillés à 360 px de haut. 2e édition : espace presse de Repos Production
 * (rprod.com). 1re édition, épuisée : photos produit de revendeurs, fond blanc détouré.
 */
export const EDITION_COVERS: Record<GameEdition, BoxCover> = {
	first: null,
	second: { source: require("@/assets/covers/second/base.png"), aspectRatio: 316 / 360 },
};

const EDIFICE: BoxCover = {
	source: require("@/assets/covers/second/edifice.png"),
	aspectRatio: 163 / 360,
};

/** Boîte de chaque extension dans chaque édition : Leaders, Cities et Armada ont été rééditées,
 * Babel n'existe qu'en 1re édition, Edifice n'a qu'une boîte (2e édition, jouable avec la 1re). */
const EXTENSION_COVERS: Record<ExtensionId, Record<GameEdition, BoxCover>> = {
	leaders: {
		first: null,
		second: { source: require("@/assets/covers/second/leaders.png"), aspectRatio: 183 / 360 },
	},
	cities: {
		first: null,
		second: { source: require("@/assets/covers/second/cities.png"), aspectRatio: 201 / 360 },
	},
	babel: {
		first: { source: require("@/assets/covers/first/babel.png"), aspectRatio: 329 / 360 },
		second: null,
	},
	armada: {
		first: null,
		second: { source: require("@/assets/covers/second/armada.png"), aspectRatio: 203 / 360 },
	},
	edifice: { first: EDIFICE, second: EDIFICE },
};

/** Couverture d'une extension dans l'édition choisie. */
export function getExtensionCover(extension: ExtensionId, edition: GameEdition): BoxCover {
	return EXTENSION_COVERS[extension][edition];
}
