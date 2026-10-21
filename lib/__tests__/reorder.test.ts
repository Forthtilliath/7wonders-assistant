import { moveItem } from "@/lib/reorder";

describe("moveItem", () => {
	it("échange un élément avec son voisin", () => {
		expect(moveItem(["a", "b", "c"], 1, -1)).toEqual(["b", "a", "c"]);
		expect(moveItem(["a", "b", "c"], 1, 1)).toEqual(["a", "c", "b"]);
	});

	it("ne bouge rien hors des bornes", () => {
		expect(moveItem(["a", "b"], 0, -1)).toEqual(["a", "b"]);
		expect(moveItem(["a", "b"], 1, 1)).toEqual(["a", "b"]);
		expect(moveItem(["a", "b"], 5, -1)).toEqual(["a", "b"]);
	});

	it("ne modifie pas le tableau d'origine", () => {
		const items = ["a", "b"];
		moveItem(items, 0, 1);
		expect(items).toEqual(["a", "b"]);
	});
});
