import { getMaxPlayers } from "@/constants/game";

describe("getMaxPlayers", () => {
	it("limite le jeu de base à 7 joueurs", () => {
		expect(getMaxPlayers([])).toBe(7);
		expect(getMaxPlayers(["leaders", "armada"])).toBe(7);
	});

	it("ajoute une place avec l'extension Cities", () => {
		expect(getMaxPlayers(["cities"])).toBe(8);
		expect(getMaxPlayers(["leaders", "cities", "armada"])).toBe(8);
	});
});
