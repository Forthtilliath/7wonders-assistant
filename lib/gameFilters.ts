import type { ExtensionId, Game } from "@/types/game";

/** Extensions cochées à exiger (ET logique). Tableau vide = pas de filtre (toutes les parties). */
export type ExtensionFilter = ExtensionId[];

/**
 * Filtre les parties par extensions utilisées. Comparer des scores entre parties avec et sans
 * extensions n'a pas beaucoup de sens (plus d'extensions = plus d'occasions de marquer des
 * points), d'où l'intérêt de pouvoir isoler un sous-ensemble homogène.
 */
export function filterGamesByExtension(games: Game[], filter: ExtensionFilter): Game[] {
	if (filter.length === 0) return games;
	return games.filter((g) => filter.every((ext) => g.extensions.includes(ext)));
}
