import type { Game } from "@/types/game";
import { HISTORY_STORE_VERSION, migrateHistoryStoreData, useHistoryStore } from "../historyStore";

function makeGame(id: string, createdAt = 0): Game {
	return { id, createdAt, extensions: [], playerIds: [], entries: {} };
}

describe("useHistoryStore", () => {
	beforeEach(() => {
		useHistoryStore.setState({ games: [] });
	});

	it("addGame insère la nouvelle partie en tête de liste", () => {
		useHistoryStore.getState().addGame(makeGame("1"));
		useHistoryStore.getState().addGame(makeGame("2"));

		expect(useHistoryStore.getState().games.map((g) => g.id)).toEqual(["2", "1"]);
	});

	it("removeGame retire uniquement la partie ciblée", () => {
		useHistoryStore.getState().addGame(makeGame("1"));
		useHistoryStore.getState().addGame(makeGame("2"));

		useHistoryStore.getState().removeGame("1");

		expect(useHistoryStore.getState().games.map((g) => g.id)).toEqual(["2"]);
	});

	it("clearHistory vide toute la liste", () => {
		useHistoryStore.getState().addGame(makeGame("1"));

		useHistoryStore.getState().clearHistory();

		expect(useHistoryStore.getState().games).toEqual([]);
	});

	it("replaceAll écrase entièrement la liste (utilisé par l'import JSON)", () => {
		useHistoryStore.getState().addGame(makeGame("1"));
		const replacement = [makeGame("import-1"), makeGame("import-2")];

		useHistoryStore.getState().replaceAll(replacement);

		expect(useHistoryStore.getState().games).toEqual(replacement);
	});
});

describe("migrateHistoryStoreData", () => {
	it("garde les données à la version courante", () => {
		const state = { games: [makeGame("1")] };
		expect(migrateHistoryStoreData(state, HISTORY_STORE_VERSION)).toBe(state);
	});

	it("réinitialise sur une version incompatible plutôt que de garder des données obsolètes", () => {
		expect(migrateHistoryStoreData({ games: ["données obsolètes"] }, 1)).toEqual({ games: [] });
	});
});
