import { computeMilitaryScore } from "../military";

describe("computeMilitaryScore", () => {
	it("ne donne aucun point pour 3 égalités", () => {
		expect(computeMilitaryScore({ age1: "tie", age2: "tie", age3: "tie" }).total).toBe(0);
	});

	it("donne 1/3/5 points pour une victoire à chaque âge", () => {
		const result = computeMilitaryScore({ age1: "win", age2: "win", age3: "win" });
		expect(result.perAge).toEqual([1, 3, 5]);
		expect(result.total).toBe(9);
	});

	it("retire 1 point par défaite, quel que soit l'âge", () => {
		const result = computeMilitaryScore({ age1: "loss", age2: "loss", age3: "loss" });
		expect(result.perAge).toEqual([-1, -1, -1]);
		expect(result.total).toBe(-3);
	});

	it("gère un mélange victoire/égalité/défaite", () => {
		const result = computeMilitaryScore({ age1: "win", age2: "tie", age3: "loss" });
		expect(result.perAge).toEqual([1, 0, -1]);
		expect(result.total).toBe(0);
	});
});
