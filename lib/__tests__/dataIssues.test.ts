import { describeDataIssues, rescueCopyUris } from "@/lib/dataIssues";

describe("describeDataIssues", () => {
	it("nomme les données concernées et la cause, sans doublon", () => {
		const text = describeDataIssues([
			{ storeName: "players-store", kind: "migration", copyUri: "a" },
			{ storeName: "history-store", kind: "migration", copyUri: "b" },
			{ storeName: "wonders-store", kind: "migration", copyUri: "c" },
		]);
		expect(text).toContain(
			"les joueurs, l'historique des parties et les merveilles personnalisées.",
		);
		expect(text.match(/ne sait pas les convertir/g)).toHaveLength(1);
		expect(text).toContain("rien n'est effacé");
	});

	it("explique le retour à une version antérieure", () => {
		const text = describeDataIssues([{ storeName: "groups-store", kind: "newer", copyUri: null }]);
		expect(text).toContain(": les groupes.");
		expect(text).toContain("version plus récente");
	});
});

describe("rescueCopyUris", () => {
	it("ne garde que les copies exportables, sans doublon", () => {
		expect(
			rescueCopyUris([
				{ storeName: "a", kind: "migration", copyUri: "x" },
				{ storeName: "b", kind: "migration", copyUri: null },
				{ storeName: "c", kind: "newer", copyUri: "x" },
			]),
		).toEqual(["x"]);
	});
});
