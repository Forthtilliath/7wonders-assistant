import { createEmptyPlayerGameEntry, type PlayerGameEntry } from "@/types/game";
import {
	computePlayerScore,
	filterActiveCategories,
	getCategoryScore,
	rankPlayers,
} from "../total";

function makeEntry(playerId: string, patch: Partial<PlayerGameEntry> = {}): PlayerGameEntry {
	return { ...createEmptyPlayerGameEntry(playerId), ...patch };
}

describe("computePlayerScore", () => {
	it("additionne toutes les catégories, sciences comprises via le moteur dédié", () => {
		const entry = makeEntry("p1", {
			military: { points: 3 },
			treasury: { points: 4 },
			wonders: { points: 5 },
			civilians: { points: 6 },
			commercials: { points: 2 },
			guilds: { points: 7 },
			leaders: { points: 1 },
			cities: { points: 2 },
			naval: { points: 3 },
			armada: { points: 4 },
			babel: { tiles: 2 },
			scientifics: { compass: 2, tablet: 2, gear: 2, wildcards: 0, maxSymbols: 0 },
		});

		const breakdown = computePlayerScore(entry);

		// science: 2²+2²+2² + 7×2 = 12+14 = 26
		expect(breakdown.scientifics).toBe(26);
		expect(breakdown.naval).toBe(3);
		expect(breakdown.armada).toBe(4);
		// 2 tuiles Babel = 5 pts.
		expect(breakdown.babel).toBe(5);
		expect(breakdown.total).toBe(3 + 4 + 5 + 6 + 2 + 26 + 7 + 1 + 2 + 5 + 3 + 4);
		expect(breakdown.playerId).toBe("p1");
	});

	it("gère un score total négatif (merveille pénalisante)", () => {
		const entry = makeEntry("p1", { wonders: { points: -3 } });
		expect(computePlayerScore(entry).total).toBe(-3);
	});
});

describe("rankPlayers", () => {
	it("classe par score total décroissant", () => {
		const a = computePlayerScore(makeEntry("a", { military: { points: 10 } }));
		const b = computePlayerScore(makeEntry("b", { military: { points: 20 } }));
		const c = computePlayerScore(makeEntry("c", { military: { points: 5 } }));

		const ranked = rankPlayers([a, b, c]);

		expect(ranked.map((r) => r.playerId)).toEqual(["b", "a", "c"]);
		expect(ranked.map((r) => r.rank)).toEqual([1, 2, 3]);
	});

	it("départage une égalité de score total par le trésor", () => {
		const a = computePlayerScore(
			makeEntry("a", { military: { points: 10 }, treasury: { points: 5 } }),
		);
		const b = computePlayerScore(
			makeEntry("b", { military: { points: 10 }, treasury: { points: 8 } }),
		);

		const ranked = rankPlayers([a, b]);

		expect(ranked.map((r) => r.playerId)).toEqual(["b", "a"]);
		expect(ranked.map((r) => r.rank)).toEqual([1, 2]);
	});

	it("attribue le même rang aux ex-aequo parfaits (score total ET trésor) et saute le rang suivant", () => {
		const a = computePlayerScore(
			makeEntry("a", { military: { points: 10 }, treasury: { points: 5 } }),
		);
		const b = computePlayerScore(
			makeEntry("b", { military: { points: 10 }, treasury: { points: 5 } }),
		);
		const c = computePlayerScore(makeEntry("c", { military: { points: 1 } }));

		const ranked = rankPlayers([a, b, c]);

		expect(ranked.map((r) => r.rank)).toEqual([1, 1, 3]);
	});
});

describe("getCategoryScore", () => {
	it("lit la valeur de chaque catégorie sur un score déjà calculé", () => {
		const score = computePlayerScore(
			makeEntry("p1", {
				military: { points: 3 },
				treasury: { points: 4 },
				wonders: { points: 5 },
				civilians: { points: 6 },
				commercials: { points: 2 },
				guilds: { points: 7 },
				leaders: { points: 1 },
				cities: { points: 2 },
				naval: { points: 8 },
				armada: { points: 9 },
				babel: { tiles: 3 },
			}),
		);

		expect(getCategoryScore(score, "military")).toBe(3);
		expect(getCategoryScore(score, "treasury")).toBe(4);
		expect(getCategoryScore(score, "wonders")).toBe(5);
		expect(getCategoryScore(score, "civilians")).toBe(6);
		expect(getCategoryScore(score, "commercials")).toBe(2);
		expect(getCategoryScore(score, "guilds")).toBe(7);
		expect(getCategoryScore(score, "leaders")).toBe(1);
		expect(getCategoryScore(score, "cities")).toBe(2);
		expect(getCategoryScore(score, "naval")).toBe(8);
		expect(getCategoryScore(score, "armada")).toBe(9);
		expect(getCategoryScore(score, "babel")).toBe(10);
	});
});

describe("filterActiveCategories", () => {
	it("retourne l'état actif/inactif de chaque extension", () => {
		expect(filterActiveCategories(["leaders", "armada"])).toEqual({
			leaders: true,
			cities: false,
			babel: false,
			naval: true,
			armada: true,
		});
	});

	it("tout est inactif sans extension", () => {
		expect(filterActiveCategories([])).toEqual({
			leaders: false,
			cities: false,
			babel: false,
			naval: false,
			armada: false,
		});
	});
});
