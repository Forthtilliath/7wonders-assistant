import { getOrderedCategories } from "../categories";

describe("getOrderedCategories", () => {
	it("ne retourne que les 7 catégories de base sans extension", () => {
		expect(getOrderedCategories([])).toEqual([
			"military",
			"treasury",
			"wonders",
			"civilians",
			"commercials",
			"scientifics",
			"guilds",
		]);
	});

	it("insère Maritime juste après Militaire, et Armada (plateau) en dernier, quand Armada est active", () => {
		expect(getOrderedCategories(["armada"])).toEqual([
			"military",
			"armada",
			"treasury",
			"wonders",
			"civilians",
			"commercials",
			"scientifics",
			"guilds",
			"islands",
		]);
	});

	it("ajoute Leaders puis Cités à la suite des catégories de base, sans Armada", () => {
		expect(getOrderedCategories(["leaders", "cities"])).toEqual([
			"military",
			"treasury",
			"wonders",
			"civilians",
			"commercials",
			"scientifics",
			"guilds",
			"leaders",
			"cities",
		]);
	});

	it("combine toutes les extensions dans l'ordre officiel, Maritime après Militaire et Armada en dernier", () => {
		expect(getOrderedCategories(["leaders", "cities", "armada"])).toEqual([
			"military",
			"armada",
			"treasury",
			"wonders",
			"civilians",
			"commercials",
			"scientifics",
			"guilds",
			"leaders",
			"cities",
			"islands",
		]);
	});
});
