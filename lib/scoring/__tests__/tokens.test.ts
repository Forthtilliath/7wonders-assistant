import { ARMADA_TOKENS, computeTokensTotal, MILITARY_TOKENS } from "../tokens";

describe("computeTokensTotal", () => {
	it("retourne 0 sans aucun jeton compté", () => {
		expect(computeTokensTotal(MILITARY_TOKENS, [0, 0, 0, 0])).toBe(0);
	});

	it("additionne les jetons militaires (victoires + défaites)", () => {
		// 2 victoires Âge I (+1), 1 victoire Âge III (+5), 1 défaite (-1) => 2 + 5 - 1 = 6
		expect(computeTokensTotal(MILITARY_TOKENS, [2, 0, 1, 1])).toBe(6);
	});

	it("additionne les jetons navals Armada, y compris plusieurs défaites de valeurs différentes", () => {
		// +7, +5, -1, -2 => 9
		expect(computeTokensTotal(ARMADA_TOKENS, [0, 0, 1, 1, 1, 1, 0])).toBe(9);
	});

	it("traite les compteurs manquants comme 0", () => {
		expect(computeTokensTotal(MILITARY_TOKENS, [1])).toBe(1);
	});
});
