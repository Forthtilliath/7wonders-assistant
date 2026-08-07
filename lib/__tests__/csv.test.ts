import type { Game, Player } from "@/types/game";
import { createEmptyPlayerGameEntry } from "@/types/game";
import { buildGamesCsv } from "../csv";

function makePlayer(id: string, name: string): Player {
	return { id, name, isFavorite: false, isArchived: false, createdAt: 0 };
}

describe("buildGamesCsv", () => {
	it("commence par un BOM UTF-8 suivi de l'entête", () => {
		const csv = buildGamesCsv([], []);
		expect(csv.charCodeAt(0)).toBe(0xfeff);
		expect(csv.slice(1)).toContain("Date;Nombre de joueurs;Extensions;Joueur");
	});

	it("génère une ligne par joueur par partie, avec le détail du score", () => {
		const players = [makePlayer("p1", "Alice"), makePlayer("p2", "Bob")];
		const game: Game = {
			id: "g1",
			createdAt: Date.UTC(2026, 6, 14, 12), // midi UTC : la date ISO ne dépend pas du fuseau local
			extensions: ["armada"],
			playerIds: ["p1", "p2"],
			entries: {
				p1: {
					...createEmptyPlayerGameEntry("p1"),
					military: { points: 5 },
					wonder: { name: "Gizah", side: "A" },
				},
				p2: { ...createEmptyPlayerGameEntry("p2"), military: { points: 2 } },
			},
		};

		const csv = buildGamesCsv([game], players);
		const lines = csv.slice(1).split("\r\n");

		expect(lines).toHaveLength(3); // entête + 2 joueurs
		expect(lines[1]).toContain("2026-07-14");
		expect(lines[1]).toContain("Armada");
		expect(lines[1]).toContain("Alice");
		expect(lines[1]).toContain("Gizah");
		expect(lines[1].endsWith(";5;1")).toBe(true); // total 5, classement 1er (devant grâce au militaire)
		expect(lines[2]).toContain("Bob");
	});

	it("indique 'Joueur supprimé' si le joueur n'existe plus dans la liste fournie", () => {
		const game: Game = {
			id: "g1",
			createdAt: 0,
			extensions: [],
			playerIds: ["p1"],
			entries: { p1: createEmptyPlayerGameEntry("p1") },
		};

		const csv = buildGamesCsv([game], []);

		expect(csv).toContain("Joueur supprimé");
	});

	it("échappe les champs contenant le séparateur ou des guillemets", () => {
		const players = [makePlayer("p1", 'Ali "Le Pro" ce; là')];
		const game: Game = {
			id: "g1",
			createdAt: 0,
			extensions: [],
			playerIds: ["p1"],
			entries: { p1: createEmptyPlayerGameEntry("p1") },
		};

		const csv = buildGamesCsv([game], players);

		expect(csv).toContain('"Ali ""Le Pro"" ce; là"');
	});
});
