import { computeBarChartScale } from "../chartScale";

describe("computeBarChartScale", () => {
	it("découpe une plage positive simple en sections régulières", () => {
		const scale = computeBarChartScale([5, 10, 15, 20]);
		expect(scale.stepValue).toBe(5);
		expect(scale.noOfSections).toBe(4);
		expect(scale.noOfSectionsBelowXAxis).toBe(0);
		expect(scale.maxValue).toBe(20);
		expect(scale.mostNegativeValue).toBe(0);
	});

	it("garde le même pas au-dessus et en dessous de l'axe avec des valeurs négatives", () => {
		const scale = computeBarChartScale([-2, 0.5, 15]);
		expect(scale.stepValue).toBe(4);
		expect(scale.noOfSections).toBe(4);
		expect(scale.noOfSectionsBelowXAxis).toBe(1);
		expect(scale.maxValue).toBe(16);
		expect(scale.mostNegativeValue).toBe(-4);
	});

	it("n'exagère pas de petites valeurs : le pas ne descend jamais sous 1 point", () => {
		// Avant le correctif, un maximum de 0.2 aurait pu produire un pas minuscule et donc des
		// barres disproportionnées par rapport à leur valeur réelle.
		const scale = computeBarChartScale([0.1, 0.2]);
		expect(scale.stepValue).toBe(1);
		expect(scale.maxValue).toBeGreaterThanOrEqual(0.2);
	});

	it("ne plante pas sur un tableau vide ou toutes valeurs nulles", () => {
		expect(() => computeBarChartScale([])).not.toThrow();
		const scale = computeBarChartScale([0, 0, 0]);
		expect(scale.stepValue).toBeGreaterThan(0);
		expect(scale.noOfSections).toBeGreaterThan(0);
	});

	it("garde un nombre de sections stable même quand le maximum positif est nul", () => {
		// Cas réel : un joueur dont toutes les catégories sont à 0 sauf une négative (ex. -2 en
		// merveille). `react-native-gifted-charts` rend un graphique vide si `noOfSections` tombe
		// à une valeur dégénérée dans ce cas.
		const scale = computeBarChartScale([0, 0, -2, 0, 0, 0, 0]);
		expect(scale.noOfSections).toBe(4);
		expect(scale.noOfSectionsBelowXAxis).toBe(2);
		expect(scale.mostNegativeValue).toBe(-2);
	});
});
