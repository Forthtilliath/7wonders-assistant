import type { Game } from "@/types/game";
import { createEmptyPlayerGameEntry } from "@/types/game";
import { getGameRanking } from "../game";

describe("getGameRanking", () => {
	it("calcule le classement à partir des saisies brutes d'une partie", () => {
		const game: Game = {
			id: "g1",
			createdAt: 0,
			extensions: [],
			playerIds: ["p1", "p2"],
			entries: {
				p1: { ...createEmptyPlayerGameEntry("p1"), military: { points: 5 } },
				p2: { ...createEmptyPlayerGameEntry("p2"), military: { points: 10 } },
			},
		};

		const ranking = getGameRanking(game);

		expect(ranking.map((r) => r.playerId)).toEqual(["p2", "p1"]);
		expect(ranking[0].total).toBe(10);
	});

	it("ignore les joueurs listés sans entrée correspondante", () => {
		const game: Game = {
			id: "g1",
			createdAt: 0,
			extensions: [],
			playerIds: ["p1", "fantome"],
			entries: {
				p1: createEmptyPlayerGameEntry("p1"),
			},
		};

		const ranking = getGameRanking(game);

		expect(ranking).toHaveLength(1);
		expect(ranking[0].playerId).toBe("p1");
	});
});
