import { getCategoryFlow, getNextCategory, getPreviousCategory } from "../categoryFlow";

describe("getCategoryFlow", () => {
	it("ne contient que les catégories de base sans extension", () => {
		expect(getCategoryFlow([])).toEqual([
			"military",
			"treasury",
			"wonders",
			"civilians",
			"commercials",
			"scientifics",
			"guilds",
		]);
	});

	it("ajoute les extensions actives à la suite, dans l'ordre officiel", () => {
		expect(getCategoryFlow(["armada", "leaders"])).toEqual([
			"military",
			"naval",
			"treasury",
			"wonders",
			"civilians",
			"commercials",
			"scientifics",
			"guilds",
			"leaders",
			"armada",
		]);
	});

	it("Armada apporte deux catégories distinctes : Maritime juste après Militaire, Armada (plateau) en dernier", () => {
		const flow = getCategoryFlow(["armada"]);
		expect(flow[0]).toBe("military");
		expect(flow[1]).toBe("naval");
		expect(flow.at(-1)).toBe("armada");
	});
});

describe("getNextCategory", () => {
	it("retourne la catégorie suivante dans le flux", () => {
		expect(getNextCategory("military", [])).toBe("treasury");
	});

	it("retourne null sur la dernière catégorie du flux", () => {
		expect(getNextCategory("guilds", [])).toBeNull();
	});

	it("prend en compte les extensions actives pour déterminer la dernière catégorie", () => {
		expect(getNextCategory("guilds", ["cities"])).toBe("cities");
		expect(getNextCategory("cities", ["cities"])).toBeNull();
	});

	it("insère Maritime juste après Militaire quand Armada est active", () => {
		expect(getNextCategory("military", ["armada"])).toBe("naval");
		expect(getNextCategory("naval", ["armada"])).toBe("treasury");
	});

	it("retourne null si la catégorie n'appartient pas au flux courant", () => {
		expect(getNextCategory("naval", [])).toBeNull();
	});
});

describe("getPreviousCategory", () => {
	it("retourne la catégorie précédente dans le flux", () => {
		expect(getPreviousCategory("treasury", [])).toBe("military");
	});

	it("retourne null sur la première catégorie du flux", () => {
		expect(getPreviousCategory("military", [])).toBeNull();
	});

	it("retourne null si la catégorie n'appartient pas au flux courant", () => {
		expect(getPreviousCategory("naval", [])).toBeNull();
	});
});
