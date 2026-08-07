import type { Game } from "@/types/game";
import { createEmptyPlayerGameEntry } from "@/types/game";
import { getWonderNameSuggestions } from "../wonders";

function makeGame(id: string, wonderNames: string[]): Game {
	const playerIds = wonderNames.map((_, i) => `p${i}`);
	const entries = Object.fromEntries(
		wonderNames.map((name, i) => [
			`p${i}`,
			{ ...createEmptyPlayerGameEntry(`p${i}`), wonder: { name, side: "A" as const } },
		]),
	);
	return { id, createdAt: 0, extensions: [], playerIds, entries };
}

describe("getWonderNameSuggestions", () => {
	it("ne suggère rien tant que la recherche est vide", () => {
		const games = [makeGame("g1", ["Gizah"])];
		expect(getWonderNameSuggestions(games, "")).toEqual([]);
		expect(getWonderNameSuggestions(games, "   ")).toEqual([]);
	});

	it("suggère les noms déjà utilisés qui contiennent la recherche", () => {
		const games = [makeGame("g1", ["Gizah", "Alexandria"]), makeGame("g2", ["Babylon"])];
		expect(getWonderNameSuggestions(games, "a")).toEqual(["Alexandria", "Babylon", "Gizah"]);
	});

	it("déduplique en ignorant la casse, en gardant la première casse rencontrée", () => {
		const games = [makeGame("g1", ["Gizah"]), makeGame("g2", ["gizah"]), makeGame("g3", ["GIZAH"])];
		expect(getWonderNameSuggestions(games, "giz")).toEqual(["Gizah"]);
	});

	it("n'inclut pas le nom déjà tapé exactement (à la casse près)", () => {
		const games = [makeGame("g1", ["Gizah"])];
		expect(getWonderNameSuggestions(games, "gizah")).toEqual([]);
	});

	it("ignore les entrées sans nom de merveille", () => {
		const games = [makeGame("g1", [""])];
		expect(getWonderNameSuggestions(games, "a")).toEqual([]);
	});

	it("limite le nombre de suggestions", () => {
		const games = [makeGame("g1", ["A1", "A2", "A3", "A4", "A5", "A6"])];
		expect(getWonderNameSuggestions(games, "a", 3)).toHaveLength(3);
	});
});
