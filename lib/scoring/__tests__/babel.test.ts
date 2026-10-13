import { computeBabelScore } from "../babel";

describe("computeBabelScore", () => {
	it("applique le barème des tuiles Babel posées", () => {
		expect(computeBabelScore(0)).toBe(0);
		expect(computeBabelScore(1)).toBe(2);
		expect(computeBabelScore(2)).toBe(5);
		expect(computeBabelScore(3)).toBe(10);
	});
});
