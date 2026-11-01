import type { ImageSource } from "expo-image";
import type { ExtensionId, GameEdition } from "@/types/game";

/** Couverture d'une boîte : image et proportions (largeur ÷ hauteur), pour réserver sa place avant
 * le chargement. `null` sans visuel disponible : la boîte s'affiche alors avec son seul nom. */
export type BoxCover = { source: ImageSource; aspectRatio: number } | null;

/**
 * Rendus 3D des boîtes publiés par Repos Production dans son espace presse (rprod.com), retaillés à
 * 360 px de haut. Seuls ceux de la gamme actuelle (2e édition) y figurent : la boîte de la 1re
 * édition et Babel, épuisées, n'ont pas encore de visuel.
 */
export const EDITION_COVERS: Record<GameEdition, BoxCover> = {
	first: null,
	second: { source: require("@/assets/covers/second.png"), aspectRatio: 316 / 360 },
};

export const EXTENSION_COVERS: Record<ExtensionId, BoxCover> = {
	leaders: { source: require("@/assets/covers/leaders.png"), aspectRatio: 183 / 360 },
	cities: { source: require("@/assets/covers/cities.png"), aspectRatio: 201 / 360 },
	babel: null,
	armada: { source: require("@/assets/covers/armada.png"), aspectRatio: 203 / 360 },
	edifice: { source: require("@/assets/covers/edifice.png"), aspectRatio: 163 / 360 },
};
