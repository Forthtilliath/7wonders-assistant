import type { Player } from "@/types/game";
import { hasDuplicateName } from "../players";

function makePlayer(id: string, name: string): Player {
	return { id, name, isFavorite: false, isArchived: false, createdAt: 0 };
}

describe("hasDuplicateName", () => {
	it("détecte un nom déjà pris, insensible à la casse et aux espaces", () => {
		const players = [makePlayer("p1", "Julien")];
		expect(hasDuplicateName(players, "  julien  ")).toBe(true);
	});

	it("ne détecte rien si le nom est unique", () => {
		const players = [makePlayer("p1", "Julien")];
		expect(hasDuplicateName(players, "Alice")).toBe(false);
	});

	it("ignore le joueur exclu (cas du renommage d'un joueur existant)", () => {
		const players = [makePlayer("p1", "Julien")];
		expect(hasDuplicateName(players, "Julien", "p1")).toBe(false);
	});

	it("ignore un nom vide", () => {
		expect(hasDuplicateName([makePlayer("p1", "Julien")], "   ")).toBe(false);
	});
});
