import { computeTreasuryScore } from "../treasury";

describe("computeTreasuryScore", () => {
	it("donne 1 point tous les 3 pièces", () => {
		expect(computeTreasuryScore(0)).toBe(0);
		expect(computeTreasuryScore(2)).toBe(0);
		expect(computeTreasuryScore(3)).toBe(1);
		expect(computeTreasuryScore(11)).toBe(3);
		expect(computeTreasuryScore(12)).toBe(4);
	});

	it("ne descend jamais sous 0", () => {
		expect(computeTreasuryScore(-5)).toBe(0);
	});
});
