import type { CategoryId, ExtensionId, PlayerGameEntry } from "@/types/game";
import { computeBabelScore } from "./babel";
import { computeScienceScore } from "./science";

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
	babel: number;
	naval: number;
	armada: number;
	total: number;
};

/** Calcule le détail du score d'un joueur pour une partie à partir de sa saisie brute. */
export function computePlayerScore(entry: PlayerGameEntry): PlayerScoreBreakdown {
	const military = entry.military.points;
	const treasury = entry.treasury.points;
	const scientifics = computeScienceScore(entry.scientifics).total;
	const wonders = entry.wonders.points;
	const civilians = entry.civilians.points;
	const commercials = entry.commercials.points;
	const guilds = entry.guilds.points;
	const leaders = entry.leaders.points;
	const cities = entry.cities.points;
	const babel = computeBabelScore(entry.babel.tiles);
	const naval = entry.naval.points;
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
		babel +
		naval +
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
		babel,
		naval,
		armada,
		total,
	};
}

/**
 * Valeur d'une catégorie donnée dans un score déjà calculé, sans passer par un accès dynamique
 * `score[category]` (qui obligerait à un cast `as` non vérifié par le compilateur). Le `switch`
 * exhaustif sur `CategoryId` fait qu'oublier une catégorie ici est une erreur de compilation.
 */
export function getCategoryScore(score: PlayerScoreBreakdown, category: CategoryId): number {
	switch (category) {
		case "military":
			return score.military;
		case "treasury":
			return score.treasury;
		case "wonders":
			return score.wonders;
		case "civilians":
			return score.civilians;
		case "commercials":
			return score.commercials;
		case "scientifics":
			return score.scientifics;
		case "guilds":
			return score.guilds;
		case "leaders":
			return score.leaders;
		case "cities":
			return score.cities;
		case "babel":
			return score.babel;
		case "naval":
			return score.naval;
		case "armada":
			return score.armada;
	}
}

export type RankedPlayerScore = PlayerScoreBreakdown & { rank: number };

/**
 * Classe les joueurs par score total décroissant. La règle officielle départage les égalités par
 * le nombre de pièces ; comme le trésor est désormais saisi directement en points (les jetons de
 * dette de Cities ne se reflètent pas dans les pièces restantes), on approxime ce départage avec le
 * score de trésor : c'est la meilleure info dont on dispose sans redemander les pièces.
 */
export function rankPlayers(breakdowns: PlayerScoreBreakdown[]): RankedPlayerScore[] {
	const sorted = [...breakdowns].sort((a, b) => {
		if (b.total !== a.total) return b.total - a.total;
		return b.treasury - a.treasury;
	});

	let rank = 1;
	return sorted.map((score, index) => {
		if (index > 0) {
			const previous = sorted[index - 1];
			const tied = previous.total === score.total && previous.treasury === score.treasury;
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
		babel: extensions.includes("babel"),
		naval: extensions.includes("armada"),
		armada: extensions.includes("armada"),
	};
}
