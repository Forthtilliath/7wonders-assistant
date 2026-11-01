import { makeGame } from "@/test-utils/fixtures";
import { createEmptyPlayerGameEntry } from "@/types/game";
import {
	GAME_STORE_VERSION,
	initialGameState,
	migrateGameStoreData,
	useGameStore,
} from "../gameStore";
import { useHistoryStore } from "../historyStore";
import { useWondersStore } from "../wondersStore";

describe("useGameStore", () => {
	beforeEach(() => {
		useGameStore.setState({ ...initialGameState });
		useHistoryStore.setState({ games: [] });
		useWondersStore.setState({ customWonders: [], packs: [] });
	});

	it("startNewGame initialise une entrée vide par joueur", () => {
		useGameStore.getState().startNewGame(["p1", "p2"], ["leaders"]);

		const state = useGameStore.getState();
		expect(state.playerIds).toEqual(["p1", "p2"]);
		expect(state.extensions).toEqual(["leaders"]);
		// Sans édition précisée : la 1re, qui propose toutes les extensions.
		expect(state.edition).toBe("first");
		expect(Object.keys(state.entries)).toEqual(["p1", "p2"]);
		expect(state.startedAt).not.toBeNull();
	});

	it("hasOngoingGame reflète la présence de joueurs dans la partie en cours", () => {
		expect(useGameStore.getState().hasOngoingGame()).toBe(false);
		useGameStore.getState().startNewGame(["p1"], []);
		expect(useGameStore.getState().hasOngoingGame()).toBe(true);
	});

	it("updateEntry applique le patch uniquement à l'entrée du joueur ciblé", () => {
		useGameStore.getState().startNewGame(["p1", "p2"], []);

		useGameStore.getState().updateEntry("p1", (entry) => ({
			...entry,
			civilians: { points: 12 },
		}));

		expect(useGameStore.getState().entries.p1.civilians.points).toBe(12);
		expect(useGameStore.getState().entries.p2.civilians.points).toBe(0);
	});

	it("updateEntry ne fait rien si le joueur n'existe pas dans la partie en cours", () => {
		useGameStore.getState().startNewGame(["p1"], []);
		const before = useGameStore.getState().entries;

		useGameStore
			.getState()
			.updateEntry("inconnu", (entry) => ({ ...entry, civilians: { points: 99 } }));

		expect(useGameStore.getState().entries).toBe(before);
	});

	it("updateExtensions change les extensions sans toucher aux entrées si rien n'est retiré", () => {
		useGameStore.getState().startNewGame(["p1"], ["leaders"]);
		useGameStore.getState().updateEntry("p1", (entry) => ({ ...entry, leaders: { points: 7 } }));

		useGameStore.getState().updateExtensions(["leaders", "cities"]);

		expect(useGameStore.getState().extensions).toEqual(["leaders", "cities"]);
		expect(useGameStore.getState().entries.p1.leaders.points).toBe(7);
	});

	it("updateExtensions remet à zéro les catégories des extensions retirées, pour tous les joueurs", () => {
		useGameStore.getState().startNewGame(["p1", "p2"], ["armada"]);
		useGameStore.getState().updateEntry("p1", (entry) => ({
			...entry,
			naval: { points: 5 },
			armada: { points: 3 },
		}));
		useGameStore.getState().updateEntry("p2", (entry) => ({ ...entry, naval: { points: 2 } }));

		useGameStore.getState().updateExtensions([]);

		const state = useGameStore.getState();
		expect(state.extensions).toEqual([]);
		expect(state.entries.p1.naval.points).toBe(0);
		expect(state.entries.p1.armada.points).toBe(0);
		expect(state.entries.p2.naval.points).toBe(0);
	});

	it("updateExtensions remet à zéro les tuiles Babel quand l'extension est retirée", () => {
		useGameStore.getState().startNewGame(["p1"], ["babel", "leaders"]);
		useGameStore.getState().updateEntry("p1", (entry) => ({
			...entry,
			babel: { tiles: 3 },
			leaders: { points: 4 },
		}));

		useGameStore.getState().updateExtensions(["leaders"]);

		expect(useGameStore.getState().entries.p1.babel).toEqual({ tiles: 0 });
		expect(useGameStore.getState().entries.p1.leaders.points).toBe(4);
	});

	it("toGame construit un Game sans id à partir de l'état courant", () => {
		useGameStore.getState().startNewGame(["p1"], ["cities"], "second");

		const game = useGameStore.getState().toGame();

		expect(game.id).toBe("");
		expect(game.playerIds).toEqual(["p1"]);
		expect(game.edition).toBe("second");
		expect(game.extensions).toEqual(["cities"]);
		expect(game.finishedAt).toBeUndefined();
	});

	it("finishGame archive la partie dans l'historique et réinitialise la partie en cours", () => {
		useGameStore.getState().startNewGame(["p1"], []);

		const finished = useGameStore.getState().finishGame();

		expect(finished.id).not.toBe("");
		expect(finished.finishedAt).toBeDefined();
		expect(useHistoryStore.getState().games).toHaveLength(1);
		expect(useHistoryStore.getState().games[0].id).toBe(finished.id);
		expect(useGameStore.getState().hasOngoingGame()).toBe(false);
	});

	it("finishGame remplace une partie corrigée à sa place, avec son id et sa date de fin", () => {
		const older = makeGame("g1", { p1: 10, p2: 20 });
		const edited = makeGame("g2", { p1: 30, p2: 5 }, { extensions: ["cities"] });
		useHistoryStore.setState({ games: [edited, older] });

		useGameStore.getState().editFinishedGame(edited);
		expect(useGameStore.getState()).toMatchObject({
			editingGameId: "g2",
			playerIds: ["p1", "p2"],
			extensions: ["cities"],
			startedAt: edited.createdAt,
		});
		useGameStore.getState().updateEntry("p2", (e) => ({ ...e, civilians: { points: 50 } }));
		const saved = useGameStore.getState().finishGame();

		const games = useHistoryStore.getState().games;
		expect(games.map((g) => g.id)).toEqual(["g2", "g1"]);
		expect(games[0]).toEqual(saved);
		expect(saved.finishedAt).toBe(edited.finishedAt);
		expect(saved.entries.p2.civilians.points).toBe(50);
		expect(games[1]).toBe(older);
		expect(useGameStore.getState()).toMatchObject(initialGameState);
	});

	it("finishGame remet une partie corrigée supprimée entre-temps de l'historique", () => {
		useGameStore.getState().editFinishedGame(makeGame("g1", { p1: 10 }));
		useHistoryStore.setState({ games: [] });

		useGameStore.getState().finishGame();

		expect(useHistoryStore.getState().games.map((g) => g.id)).toEqual(["g1"]);
	});

	it("finishGame enregistre l'écriture de référence des merveilles", () => {
		useWondersStore.setState({ customWonders: [{ id: "w1", name: "Atlantide", createdAt: 0 }] });
		useGameStore.getState().startNewGame(["p1", "p2", "p3"], []);
		const setWonder = (playerId: string, name: string) =>
			useGameStore.getState().updateEntry(playerId, (e) => ({ ...e, wonder: { name, side: "A" } }));
		setWonder("p1", "rhodos");
		setWonder("p2", "ATLANTIDE");
		setWonder("p3", "Lémurie");

		const { entries } = useGameStore.getState().finishGame();

		expect([entries.p1, entries.p2, entries.p3].map((e) => e.wonder.name)).toEqual([
			"Rhódos",
			"Atlantide",
			"Lémurie",
		]);
	});

	it("resetGame revient à l'état initial", () => {
		useGameStore.getState().startNewGame(["p1"], ["armada"]);

		useGameStore.getState().resetGame();

		expect(useGameStore.getState()).toMatchObject(initialGameState);
	});
});

describe("migrateGameStoreData", () => {
	it("garde les données à la version courante", () => {
		const state = { ...initialGameState, playerIds: ["p1"] };
		expect(migrateGameStoreData(state, GAME_STORE_VERSION)).toBe(state);
	});

	it("renomme les catégories Armada d'une partie en cours venant de la v5, sans la perdre", () => {
		const {
			naval: _naval,
			armada: _armada,
			babel: _babel,
			...rest
		} = createEmptyPlayerGameEntry("p1");
		const v5Entry = { ...rest, armada: { points: 4 }, islands: { points: 6 } };
		const v5State = { ...initialGameState, playerIds: ["p1"], entries: { p1: v5Entry } };

		const migrated = migrateGameStoreData(v5State, 5);

		expect(migrated.playerIds).toEqual(["p1"]);
		expect(migrated.entries.p1).toEqual({
			...rest,
			naval: { points: 4 },
			armada: { points: 6 },
			babel: { tiles: 0 },
		});
	});

	it("ajoute la catégorie Babel à une partie en cours venant de la v6, sans la perdre", () => {
		const { babel: _babel, ...v6Entry } = {
			...createEmptyPlayerGameEntry("p1"),
			leaders: { points: 5 },
		};
		const v6State = { ...initialGameState, playerIds: ["p1"], entries: { p1: v6Entry } };

		const migrated = migrateGameStoreData(v6State, 6);

		expect(migrated.entries.p1).toEqual({ ...v6Entry, babel: { tiles: 0 } });
	});

	it("renomme les merveilles du jeu de base d'une partie en cours venant de la v7", () => {
		const entry = {
			...createEmptyPlayerGameEntry("p1"),
			wonder: { name: "Halicarnasse", side: "B" },
		};
		const v7State = { ...initialGameState, playerIds: ["p1"], entries: { p1: entry } };

		const migrated = migrateGameStoreData(v7State, 7);

		expect(migrated.entries.p1.wonder).toEqual({ name: "Halikarnassos", side: "B" });
	});

	it("réinitialise sur une version incompatible plutôt que de garder des données obsolètes", () => {
		expect(migrateGameStoreData({ playerIds: ["obsolète"] }, 1)).toEqual(initialGameState);
	});
});
