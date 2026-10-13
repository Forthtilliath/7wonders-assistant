import {
	getAvailableExtensions,
	getExtensionsWarning,
	keepAvailableExtensions,
} from "@/constants/editions";

describe("éditions du jeu", () => {
	it("propose Babel uniquement avec la 1re édition, Edifice avec les deux", () => {
		expect(getAvailableExtensions("first")).toEqual([
			"leaders",
			"cities",
			"babel",
			"edifice",
			"armada",
		]);
		expect(getAvailableExtensions("second")).toEqual(["leaders", "cities", "edifice", "armada"]);
	});

	it("retire d'une sélection les extensions absentes de l'édition", () => {
		expect(keepAvailableExtensions(["babel", "leaders"], "second")).toEqual(["leaders"]);
		expect(keepAvailableExtensions(["babel", "leaders"], "first")).toEqual(["babel", "leaders"]);
	});

	it("avertit seulement quand Babel et Edifice sont cochées ensemble", () => {
		expect(getExtensionsWarning(["babel", "edifice"])).toBe(
			"Edifice remplace Babel : les deux ne se jouent normalement pas ensemble.",
		);
		expect(getExtensionsWarning(["babel"])).toBeNull();
		expect(getExtensionsWarning(["edifice", "armada"])).toBeNull();
	});
});
