import { Share } from "react-native";
import { createEmptyPlayerGameEntry, type Game, type Player } from "@/types/game";
import { buildGameShareText, shareGameText } from "../shareGame";

function makePlayer(id: string, name: string): Player {
	return { id, name, isFavorite: false, isArchived: false, createdAt: 0 };
}

function makeGame(points: Record<string, number>, extensions: Game["extensions"] = []): Game {
	const playerIds = Object.keys(points);
	return {
		id: "g1",
		createdAt: new Date(2026, 9, 11, 21).getTime(),
		extensions,
		playerIds,
		entries: Object.fromEntries(
			playerIds.map((id) => [
				id,
				{ ...createEmptyPlayerGameEntry(id), civilians: { points: points[id] } },
			]),
		),
	};
}

describe("buildGameShareText", () => {
	const players = ["Alice", "Bob", "Chloé", "David"].map((name) => makePlayer(name, name));

	it("liste les joueurs par rang avec médailles puis numéros", () => {
		const text = buildGameShareText(
			makeGame({ Bob: 55, Alice: 62, David: 40, Chloé: 48 }),
			players,
		);
		expect(text.split("\n")).toEqual([
			"7 Wonders · 11 octobre 2026",
			"",
			"🥇 Alice — 62 pts",
			"🥈 Bob — 55 pts",
			"🥉 Chloé — 48 pts",
			"4. David — 40 pts",
		]);
	});

	it("mentionne les extensions et la merveille jouée", () => {
		const game = makeGame({ Alice: 62, Bob: 55 }, ["leaders", "cities"]);
		game.entries.Alice.wonder = { name: " Rhodes ", side: "B" };
		game.entries.Bob.wonder = { name: "Gizeh", side: null };

		const lines = buildGameShareText(game, players).split("\n");
		expect(lines[1]).toBe("Extensions : Leaders, Cities");
		expect(lines).toContain("🥇 Alice — 62 pts (Rhodes B)");
		expect(lines).toContain("🥈 Bob — 55 pts (Gizeh)");
	});

	it("donne la même médaille aux ex æquo", () => {
		const text = buildGameShareText(makeGame({ Alice: 50, Bob: 50 }), players);
		expect(text).toContain("🥇 Alice — 50 pts");
		expect(text).toContain("🥇 Bob — 50 pts");
	});

	it("garde une ligne pour un joueur supprimé depuis", () => {
		const text = buildGameShareText(makeGame({ Alice: 50, Inconnu: 40 }), players);
		expect(text).toContain("🥈 Joueur supprimé — 40 pts");
	});
});

describe("shareGameText", () => {
	it("ouvre la feuille de partage du système avec le classement en texte", async () => {
		const share = jest.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction" });
		const players = [makePlayer("Alice", "Alice"), makePlayer("Bob", "Bob")];

		await shareGameText(makeGame({ Alice: 10, Bob: 20 }), players);

		expect(share).toHaveBeenCalledWith({ message: expect.stringContaining("🥇 Bob — 20 pts") });
	});
});
