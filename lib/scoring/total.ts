import type { ExtensionId, PlayerGameEntry } from "@/types/game";
import { computeScienceScore } from "./science";
import { computeTreasuryScore } from "./treasury";

export type PlayerScoreBreakdown = {
	playerId: string;
	military: number;
	treasury: number;
	wonders: number;
	civilians: number;
	commercials: number;
	scientifics: number;
	guilds: number;
	leaders: number;
	cities: number;
	armada: number;
	total: number;
};

/** Calcule le détail du score d'un joueur pour une partie à partir de sa saisie brute. */
export function computePlayerScore(entry: PlayerGameEntry): PlayerScoreBreakdown {
	const military = entry.military.points;
	const treasury = computeTreasuryScore(entry.treasury.coins);
	const scientifics = computeScienceScore(entry.scientifics).total;
	const wonders = entry.wonders.points;
	const civilians = entry.civilians.points;
	const commercials = entry.commercials.points;
	const guilds = entry.guilds.points;
	const leaders = entry.leaders.points;
	const cities = entry.cities.points;
	const armada = entry.armada.points;

	const total =
		military +
		treasury +
		wonders +
		civilians +
		commercials +
		scientifics +
		guilds +
		leaders +
		cities +
		armada;

	return {
		playerId: entry.playerId,
		military,
		treasury,
		wonders,
		civilians,
		commercials,
		scientifics,
		guilds,
		leaders,
		cities,
		armada,
		total,
	};
}

export type RankedPlayerScore = PlayerScoreBreakdown & { rank: number };

/**
 * Classe les joueurs par score total décroissant. En cas d'égalité, la règle officielle
 * s'applique : le joueur avec le plus de pièces l'emporte (ex-aequo sinon).
 */
export function rankPlayers(
	breakdowns: PlayerScoreBreakdown[],
	coinsByPlayerId: Record<string, number>,
): RankedPlayerScore[] {
	const sorted = [...breakdowns].sort((a, b) => {
		if (b.total !== a.total) return b.total - a.total;
		return (coinsByPlayerId[b.playerId] ?? 0) - (coinsByPlayerId[a.playerId] ?? 0);
	});

	let rank = 1;
	return sorted.map((score, index) => {
		if (index > 0) {
			const previous = sorted[index - 1];
			const tied =
				previous.total === score.total &&
				(coinsByPlayerId[previous.playerId] ?? 0) === (coinsByPlayerId[score.playerId] ?? 0);
			if (!tied) rank = index + 1;
		}
		return { ...score, rank };
	});
}

/** Retire du détail les catégories d'extension non activées pour la partie. */
export function filterActiveCategories(extensions: ExtensionId[]) {
	return {
		leaders: extensions.includes("leaders"),
		cities: extensions.includes("cities"),
		armada: extensions.includes("armada"),
	};
}
