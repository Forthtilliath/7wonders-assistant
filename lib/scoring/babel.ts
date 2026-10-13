import type { BabelTileCount } from "@/types/game";

/** Points de victoire selon le nombre de tuiles Babel posées par le joueur. */
export const BABEL_TILE_POINTS: Record<BabelTileCount, number> = { 0: 0, 1: 2, 2: 5, 3: 10 };

export const BABEL_TILE_COUNTS: BabelTileCount[] = [0, 1, 2, 3];

export function computeBabelScore(tiles: BabelTileCount): number {
	return BABEL_TILE_POINTS[tiles];
}
