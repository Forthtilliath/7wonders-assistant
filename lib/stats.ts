import { getOrderedCategories } from "@/constants/categories";
import type { CategoryId, Game, Player } from "@/types/game";
import { getGameRanking } from "./scoring/game";
import { getCategoryScore } from "./scoring/total";

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

		const categories = getOrderedCategories(game.extensions);
		for (const category of categories) {
			const value = getCategoryScore(score, category);
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

export type GlobalRecords = {
	bestScore: { playerId: string; total: number; finishedAt: number } | null;
	longestWinStreak: { playerId: string; streak: number } | null;
	closestGame: { gap: number; finishedAt: number } | null;
};

/**
 * Records remarquables sur l'historique donné : le meilleur score jamais réalisé, la plus longue
 * série de victoires consécutives d'un même joueur, et l'écart de points le plus faible entre les
 * deux premiers d'une partie ("la plus disputée"). Chaque record vaut `null` si l'historique ne
 * contient aucune partie exploitable.
 */
export function computeGlobalRecords(games: Game[]): GlobalRecords {
	let bestScore: GlobalRecords["bestScore"] = null;
	let longestWinStreak: GlobalRecords["longestWinStreak"] = null;
	let closestGame: GlobalRecords["closestGame"] = null;
	const currentStreakByPlayer = new Map<string, number>();

	// Ordre chronologique (le plus ancien d'abord) pour dérouler les séries de victoires dans le bon
	// sens ; l'historique lui-même est stocké le plus récent en premier.
	const chronological = [...games].sort(
		(a, b) => (a.finishedAt ?? a.createdAt) - (b.finishedAt ?? b.createdAt),
	);

	for (const game of chronological) {
		const finishedAt = game.finishedAt ?? game.createdAt;
		const ranking = getGameRanking(game);
		if (ranking.length === 0) continue;

		for (const score of ranking) {
			if (!bestScore || score.total > bestScore.total) {
				bestScore = { playerId: score.playerId, total: score.total, finishedAt };
			}

			const streak = score.rank === 1 ? (currentStreakByPlayer.get(score.playerId) ?? 0) + 1 : 0;
			currentStreakByPlayer.set(score.playerId, streak);
			if (streak > 0 && (!longestWinStreak || streak > longestWinStreak.streak)) {
				longestWinStreak = { playerId: score.playerId, streak };
			}
		}

		if (ranking.length >= 2) {
			const gap = ranking[0].total - ranking[1].total;
			if (!closestGame || gap < closestGame.gap) {
				closestGame = { gap, finishedAt };
			}
		}
	}

	return { bestScore, longestWinStreak, closestGame };
}

export type PlayerLeaderboardEntry = {
	playerId: string;
	gamesPlayed: number;
	wins: number;
	winRate: number;
};

/**
 * Classement des joueurs ayant au moins une partie dans l'historique donné, par taux de victoire
 * décroissant. Le nombre de parties jouées départage les égalités : un taux construit sur beaucoup
 * de parties est plus représentatif qu'un 100% obtenu sur une seule.
 */
export function computePlayerLeaderboard(
	games: Game[],
	players: Player[],
): PlayerLeaderboardEntry[] {
	return players
		.map((player) => {
			const stats = computePlayerStats(player.id, games);
			return {
				playerId: player.id,
				gamesPlayed: stats.gamesPlayed,
				wins: stats.wins,
				winRate: stats.winRate,
			};
		})
		.filter((entry) => entry.gamesPlayed > 0)
		.sort((a, b) => b.winRate - a.winRate || b.gamesPlayed - a.gamesPlayed);
}
