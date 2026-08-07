import { BASE_CATEGORY_ORDER, getExtensionCategories } from "@/constants/categories";
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

		const categories: CategoryId[] = [
			...BASE_CATEGORY_ORDER,
			...getExtensionCategories(game.extensions),
		];
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

export type WonderStats = {
	/** Nom saisi par le joueur + face (A/B), tel quel : texte libre, pas de liste fermée. */
	name: string;
	side: "A" | "B" | null;
	timesPlayed: number;
	wins: number;
	winRate: number;
	averageTotal: number;
};

/**
 * Agrège les statistiques par merveille (nom + face) sur l'historique donné. Les entrées sans nom
 * de merveille renseigné sont ignorées. Si `playerId` est fourni, ne considère que les merveilles
 * jouées par ce joueur (pour un classement "mes meilleures/pires merveilles").
 */
export function computeWonderStats(games: Game[], playerId?: string): WonderStats[] {
	const byKey = new Map<
		string,
		{ name: string; side: "A" | "B" | null; timesPlayed: number; wins: number; totalSum: number }
	>();

	for (const game of games) {
		const ranking = getGameRanking(game);
		const playerIds = playerId ? game.playerIds.filter((id) => id === playerId) : game.playerIds;

		for (const id of playerIds) {
			const entry = game.entries[id];
			const name = entry?.wonder.name.trim();
			if (!entry || !name) continue;

			const score = ranking.find((r) => r.playerId === id);
			if (!score) continue;

			const side = entry.wonder.side;
			const key = `${name.toLowerCase()}__${side ?? ""}`;
			const current = byKey.get(key) ?? { name, side, timesPlayed: 0, wins: 0, totalSum: 0 };
			current.timesPlayed += 1;
			current.totalSum += score.total;
			if (score.rank === 1) current.wins += 1;
			byKey.set(key, current);
		}
	}

	return Array.from(byKey.values()).map((w) => ({
		name: w.name,
		side: w.side,
		timesPlayed: w.timesPlayed,
		wins: w.wins,
		winRate: w.wins / w.timesPlayed,
		averageTotal: w.totalSum / w.timesPlayed,
	}));
}
