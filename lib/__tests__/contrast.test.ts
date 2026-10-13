import { contrastRatio, pickReadableText, relativeLuminance } from "../contrast";

describe("relativeLuminance", () => {
	it("vaut 0 pour le noir et 1 pour le blanc", () => {
		expect(relativeLuminance("#000000")).toBe(0);
		expect(relativeLuminance("#ffffff")).toBeCloseTo(1);
	});
});

describe("contrastRatio", () => {
	it("vaut 21 entre noir et blanc, quel que soit l'ordre", () => {
		expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21);
		expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21);
	});

	it("vaut 1 entre deux couleurs identiques", () => {
		expect(contrastRatio("#c9963b", "#c9963b")).toBe(1);
	});
});

describe("pickReadableText", () => {
	const ivory = "#fff8e7";
	const ink = "#1a1209";

	it("choisit l'encre sur une couleur claire (or)", () => {
		expect(pickReadableText("#d9ad38", ivory, ink)).toBe(ink);
	});

	it("choisit l'ivoire sur une couleur sombre (bleu nuit)", () => {
		expect(pickReadableText("#2c4f8f", ivory, ink)).toBe(ivory);
	});
});
