import { BASE_CATEGORY_ORDER } from "@/constants/categories";
import type { CategoryId, Game } from "@/types/game";
import { getGameRanking } from "./scoring/game";

export type PlayerStats = {
	gamesPlayed: number;
	wins: number;
	winRate: number;
	averageTotal: number;
	bestTotal: number;
	averageByCategory: Partial<Record<CategoryId, number>>;
};

const EMPTY_STATS: PlayerStats = {
	gamesPlayed: 0,
	wins: 0,
	winRate: 0,
	averageTotal: 0,
	bestTotal: 0,
	averageByCategory: {},
};

/** Agrège les statistiques d'un joueur à partir de son historique de parties terminées. */
export function computePlayerStats(playerId: string, games: Game[]): PlayerStats {
	const relevantGames = games.filter((g) => g.playerIds.includes(playerId));
	if (relevantGames.length === 0) return EMPTY_STATS;

	let wins = 0;
	let totalSum = 0;
	let bestTotal = -Infinity;
	const categorySums: Partial<Record<CategoryId, number>> = {};

	for (const game of relevantGames) {
		const ranking = getGameRanking(game);
		const score = ranking.find((r) => r.playerId === playerId);
		if (!score) continue;

		totalSum += score.total;
		bestTotal = Math.max(bestTotal, score.total);
		if (score.rank === 1) wins++;

		const categories: CategoryId[] = [...BASE_CATEGORY_ORDER, ...game.extensions];
		for (const category of categories) {
			const value = score[category as keyof typeof score] as number;
			categorySums[category] = (categorySums[category] ?? 0) + value;
		}
	}

	const averageByCategory: Partial<Record<CategoryId, number>> = {};
	for (const [category, sum] of Object.entries(categorySums)) {
		averageByCategory[category as CategoryId] = sum / relevantGames.length;
	}

	return {
		gamesPlayed: relevantGames.length,
		wins,
		winRate: wins / relevantGames.length,
		averageTotal: totalSum / relevantGames.length,
		bestTotal,
		averageByCategory,
	};
}
