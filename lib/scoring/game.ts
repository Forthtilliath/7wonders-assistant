import type { Game } from "@/types/game";
import { computePlayerScore, rankPlayers } from "./total";

/** Calcule le classement complet d'une partie (en cours ou terminée) à partir de ses saisies brutes. */
export function getGameRanking(game: Game) {
	const breakdowns = game.playerIds
		.map((id) => game.entries[id])
		.filter((entry) => entry != null)
		.map(computePlayerScore);

	const coinsByPlayerId = Object.fromEntries(
		Object.values(game.entries).map((e) => [e.playerId, e.treasury.coins]),
	);

	return rankPlayers(breakdowns, coinsByPlayerId);
}
