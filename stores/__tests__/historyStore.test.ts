import { createEmptyPlayerGameEntry, type Game } from "@/types/game";
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

	it("migre la v4 (sans plateau Armada) jusqu'à la version courante, sans perdre l'historique", () => {
		// En v4, "armada" contenait les jetons navals et le plateau n'existait pas encore.
		const { naval: _naval, babel: _babel, ...v4Entry } = { ...createEmptyPlayerGameEntry("p1") };
		const v4State = {
			games: [
				{
					...makeGame("1"),
					extensions: ["armada"],
					entries: { p1: { ...v4Entry, armada: { points: 4 } } },
				},
			],
		};

		const migrated = migrateHistoryStoreData(v4State, 4);

		expect(migrated.games[0].entries.p1.naval).toEqual({ points: 4 });
		expect(migrated.games[0].entries.p1.armada).toEqual({ points: 0 });
		expect(migrated.games[0].entries.p1.babel).toEqual({ tiles: 0 });
		expect(migrated.games[0].id).toBe("1");
	});

	it("renomme les catégories Armada venant de la v5 (jetons navals et plateau)", () => {
		const {
			naval: _naval,
			armada: _armada,
			babel: _babel,
			...rest
		} = createEmptyPlayerGameEntry("p1");
		const v5Entry = { ...rest, armada: { points: 4 }, islands: { points: 6 } };
		const v5State = {
			games: [{ ...makeGame("1"), extensions: ["armada"], entries: { p1: v5Entry } }],
		};

		const migrated = migrateHistoryStoreData(v5State, 5);

		expect(migrated.games[0].entries.p1).toEqual({
			...rest,
			naval: { points: 4 },
			armada: { points: 6 },
			babel: { tiles: 0 },
		});
	});

	it("ajoute la catégorie Babel aux parties venant de la v6", () => {
		const { babel: _babel, ...v6Entry } = createEmptyPlayerGameEntry("p1");
		const v6State = { games: [{ ...makeGame("1"), playerIds: ["p1"], entries: { p1: v6Entry } }] };

		const migrated = migrateHistoryStoreData(v6State, 6);

		expect(migrated.games[0].entries.p1).toEqual({ ...v6Entry, babel: { tiles: 0 } });
	});

	it("renomme les merveilles du jeu de base des parties venant de la v7, d'après leur plateau", () => {
		const entry = (playerId: string, name: string) => ({
			...createEmptyPlayerGameEntry(playerId),
			wonder: { name, side: "A" as const },
		});
		const v7State = {
			games: [
				{
					...makeGame("1"),
					playerIds: ["p1", "p2", "p3"],
					entries: {
						p1: entry("p1", "Éphèse"),
						p2: entry("p2", "gizeh"),
						p3: entry("p3", "Pétra"),
					},
				},
			],
		};

		const migrated = migrateHistoryStoreData(v7State, 7);

		expect(Object.values(migrated.games[0].entries).map((e) => e.wonder.name)).toEqual([
			"Ephesos",
			"Gizah",
			"Pétra",
		]);
	});

	it("réinitialise sur une version plus ancienne encore, sans étape de migration connue", () => {
		expect(migrateHistoryStoreData({ games: ["données obsolètes"] }, 1)).toEqual({ games: [] });
	});
});
