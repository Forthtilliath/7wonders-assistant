import type { Game, Player } from "@/types/game";
import { createEmptyPlayerGameEntry } from "@/types/game";
import {
	computeGlobalRecords,
	computePlayerLeaderboard,
	computePlayerStats,
	computeWonderStats,
} from "../stats";

function makeGame(
	id: string,
	entries: Record<string, { military?: number; wonder?: { name: string; side: "A" | "B" | null } }>,
	extensions: Game["extensions"] = [],
	createdAt = 0,
): Game {
	const gameEntries: Game["entries"] = {};
	for (const [playerId, patch] of Object.entries(entries)) {
		gameEntries[playerId] = {
			...createEmptyPlayerGameEntry(playerId),
			...(patch.military != null ? { military: { points: patch.military } } : {}),
			...(patch.wonder ? { wonder: patch.wonder } : {}),
		};
	}
	return {
		id,
		createdAt,
		finishedAt: createdAt,
		extensions,
		playerIds: Object.keys(entries),
		entries: gameEntries,
	};
}

function makePlayer(id: string): Player {
	return { id, name: id, isFavorite: false, isArchived: false, createdAt: 0 };
}

describe("computePlayerStats", () => {
	it("retourne des stats vides si le joueur n'a joué aucune partie", () => {
		expect(computePlayerStats("inconnu", [])).toEqual({
			gamesPlayed: 0,
			wins: 0,
			winRate: 0,
			averageTotal: 0,
			bestTotal: 0,
			averageByCategory: {},
		});
	});

	it("ne considère que les parties auxquelles le joueur a participé", () => {
		const games = [
			makeGame("g1", { p1: { military: 10 }, p2: { military: 3 } }),
			makeGame("g2", { p2: { military: 5 }, p3: { military: 20 } }),
		];

		const stats = computePlayerStats("p1", games);

		expect(stats.gamesPlayed).toBe(1);
	});

	it("calcule victoires, taux de victoire, moyenne et meilleur score", () => {
		const games = [
			makeGame("g1", { p1: { military: 10 }, p2: { military: 3 } }),
			makeGame("g2", { p1: { military: 2 }, p2: { military: 20 } }),
		];

		const stats = computePlayerStats("p1", games);

		expect(stats.gamesPlayed).toBe(2);
		expect(stats.wins).toBe(1);
		expect(stats.winRate).toBe(0.5);
		expect(stats.averageTotal).toBe(6);
		expect(stats.bestTotal).toBe(10);
		expect(stats.averageByCategory.military).toBe(6);
	});

	it("inclut les catégories d'extension dans la moyenne uniquement pour les parties concernées", () => {
		const games = [makeGame("g1", { p1: { military: 1 } }, ["armada"])];
		const stats = computePlayerStats("p1", games);
		expect(stats.averageByCategory.armada).toBe(0);
	});
});

describe("computeWonderStats", () => {
	it("agrège par nom + face, insensible à la casse du nom", () => {
		const games = [
			makeGame("g1", {
				p1: { military: 10, wonder: { name: "Gizah", side: "A" } },
				p2: { military: 3, wonder: { name: "Alexandria", side: "B" } },
			}),
			makeGame("g2", {
				p1: { military: 2, wonder: { name: "gizah", side: "A" } },
				p2: { military: 8, wonder: { name: "Alexandria", side: "B" } },
			}),
		];

		const stats = computeWonderStats(games);
		const gizah = stats.find((w) => w.name.toLowerCase() === "gizah");

		expect(gizah?.timesPlayed).toBe(2);
		expect(gizah?.wins).toBe(1);
		expect(gizah?.winRate).toBe(0.5);
		expect(gizah?.averageTotal).toBe(6);
	});

	it("ignore les entrées sans nom de merveille renseigné", () => {
		const games = [makeGame("g1", { p1: { military: 5, wonder: { name: "", side: null } } })];
		expect(computeWonderStats(games)).toEqual([]);
	});

	it("filtre sur un joueur donné quand playerId est fourni", () => {
		const games = [
			makeGame("g1", {
				p1: { military: 10, wonder: { name: "Gizah", side: "A" } },
				p2: { military: 3, wonder: { name: "Gizah", side: "A" } },
			}),
		];

		const stats = computeWonderStats(games, "p1");

		expect(stats).toHaveLength(1);
		expect(stats[0].timesPlayed).toBe(1);
	});

	it("distingue deux faces différentes de la même merveille", () => {
		const games = [
			makeGame("g1", { p1: { wonder: { name: "Gizah", side: "A" } } }),
			makeGame("g2", { p1: { wonder: { name: "Gizah", side: "B" } } }),
		];

		expect(computeWonderStats(games)).toHaveLength(2);
	});
});

describe("computeGlobalRecords", () => {
	it("retourne des records nuls sur un historique vide", () => {
		expect(computeGlobalRecords([])).toEqual({
			bestScore: null,
			longestWinStreak: null,
			closestGame: null,
		});
	});

	it("retient le meilleur score toutes parties confondues", () => {
		const games = [
			makeGame("g1", { p1: { military: 10 }, p2: { military: 3 } }, [], 1),
			makeGame("g2", { p1: { military: 2 }, p2: { military: 20 } }, [], 2),
		];

		const { bestScore } = computeGlobalRecords(games);

		expect(bestScore?.playerId).toBe("p2");
		expect(bestScore?.total).toBe(20);
	});

	it("calcule la plus longue série de victoires consécutives, séries interrompues comprises", () => {
		const games = [
			makeGame("g1", { p1: { military: 10 }, p2: { military: 1 } }, [], 1),
			makeGame("g2", { p1: { military: 10 }, p2: { military: 1 } }, [], 2),
			makeGame("g3", { p1: { military: 1 }, p2: { military: 10 } }, [], 3),
			makeGame("g4", { p1: { military: 10 }, p2: { military: 1 } }, [], 4),
		];

		const { longestWinStreak } = computeGlobalRecords(games);

		expect(longestWinStreak).toEqual({ playerId: "p1", streak: 2 });
	});

	it("respecte l'ordre chronologique même si l'historique est trié du plus récent au plus ancien", () => {
		const games = [
			makeGame("g2", { p1: { military: 10 }, p2: { military: 1 } }, [], 2),
			makeGame("g1", { p1: { military: 10 }, p2: { military: 1 } }, [], 1),
		];

		expect(computeGlobalRecords(games).longestWinStreak).toEqual({ playerId: "p1", streak: 2 });
	});

	it("retient l'écart de points le plus faible entre les deux premiers", () => {
		const games = [
			makeGame("g1", { p1: { military: 10 }, p2: { military: 1 } }, [], 1),
			makeGame("g2", { p1: { military: 10 }, p2: { military: 9 } }, [], 2),
		];

		expect(computeGlobalRecords(games).closestGame).toEqual({ gap: 1, finishedAt: 2 });
	});
});

describe("computePlayerLeaderboard", () => {
	it("ignore les joueurs sans aucune partie", () => {
		const games = [makeGame("g1", { p1: { military: 10 }, p2: { military: 1 } })];
		const players = [makePlayer("p1"), makePlayer("p2"), makePlayer("p3")];

		expect(computePlayerLeaderboard(games, players).map((e) => e.playerId)).toEqual(["p1", "p2"]);
	});

	it("classe par taux de victoire décroissant", () => {
		const games = [
			makeGame("g1", { p1: { military: 10 }, p2: { military: 1 } }, [], 1),
			makeGame("g2", { p1: { military: 1 }, p2: { military: 10 } }, [], 2),
			makeGame("g3", { p1: { military: 10 }, p2: { military: 1 } }, [], 3),
		];
		const players = [makePlayer("p1"), makePlayer("p2")];

		const leaderboard = computePlayerLeaderboard(games, players);

		expect(leaderboard[0]).toEqual({ playerId: "p1", gamesPlayed: 3, wins: 2, winRate: 2 / 3 });
		expect(leaderboard[1]).toEqual({ playerId: "p2", gamesPlayed: 3, wins: 1, winRate: 1 / 3 });
	});
});
