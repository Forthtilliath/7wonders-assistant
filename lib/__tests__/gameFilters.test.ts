import type { Game } from "@/types/game";
import { filterGamesByExtension } from "../gameFilters";

function makeGame(id: string, extensions: Game["extensions"]): Game {
	return { id, createdAt: 0, extensions, playerIds: [], entries: {} };
}

describe("filterGamesByExtension", () => {
	const games = [
		makeGame("base", []),
		makeGame("leaders", ["leaders"]),
		makeGame("leadersAndCities", ["leaders", "cities"]),
		makeGame("all", ["leaders", "cities", "armada"]),
	];

	it("un filtre vide ne filtre rien", () => {
		expect(filterGamesByExtension(games, [])).toHaveLength(4);
	});

	it("une extension cochée garde les parties qui l'utilisent, même combinée à d'autres", () => {
		expect(filterGamesByExtension(games, ["leaders"]).map((g) => g.id)).toEqual([
			"leaders",
			"leadersAndCities",
			"all",
		]);
	});

	it("plusieurs extensions cochées appliquent un ET logique", () => {
		expect(filterGamesByExtension(games, ["leaders", "cities"]).map((g) => g.id)).toEqual([
			"leadersAndCities",
			"all",
		]);
	});
});
