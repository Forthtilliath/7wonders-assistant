import {
	migratePlayersStoreData,
	PLAYERS_STORE_VERSION,
	selectSortedPlayers,
	usePlayersStore,
} from "../playersStore";

describe("usePlayersStore", () => {
	beforeEach(() => {
		usePlayersStore.setState({ players: [] });
	});

	it("addPlayer crée un joueur avec les valeurs par défaut", () => {
		const player = usePlayersStore.getState().addPlayer({ name: "  Isabelle  " });

		expect(player.name).toBe("Isabelle");
		expect(player.isFavorite).toBe(false);
		expect(player.isArchived).toBe(false);
		expect(usePlayersStore.getState().players).toHaveLength(1);
	});

	it("addPlayer utilise l'id fourni plutôt que d'en générer un nouveau", () => {
		const player = usePlayersStore.getState().addPlayer({ id: "fixed-id", name: "Isabelle" });

		expect(player.id).toBe("fixed-id");
		expect(usePlayersStore.getState().players[0].id).toBe("fixed-id");
	});

	it("updatePlayer ne modifie que le joueur ciblé", () => {
		const a = usePlayersStore.getState().addPlayer({ name: "A" });
		usePlayersStore.getState().addPlayer({ name: "B" });

		usePlayersStore.getState().updatePlayer(a.id, { name: "A modifié" });

		const players = usePlayersStore.getState().players;
		expect(players.find((p) => p.id === a.id)?.name).toBe("A modifié");
		expect(players.find((p) => p.name === "B")).toBeDefined();
	});

	it("removePlayer retire uniquement le joueur ciblé", () => {
		const a = usePlayersStore.getState().addPlayer({ name: "A" });
		usePlayersStore.getState().addPlayer({ name: "B" });

		usePlayersStore.getState().removePlayer(a.id);

		expect(usePlayersStore.getState().players).toHaveLength(1);
		expect(usePlayersStore.getState().players[0].name).toBe("B");
	});

	it("toggleFavorite et toggleArchived inversent l'état à chaque appel", () => {
		const a = usePlayersStore.getState().addPlayer({ name: "A" });

		usePlayersStore.getState().toggleFavorite(a.id);
		expect(usePlayersStore.getState().players[0].isFavorite).toBe(true);
		usePlayersStore.getState().toggleFavorite(a.id);
		expect(usePlayersStore.getState().players[0].isFavorite).toBe(false);

		usePlayersStore.getState().toggleArchived(a.id);
		expect(usePlayersStore.getState().players[0].isArchived).toBe(true);
	});

	it("replaceAll écrase entièrement la liste (utilisé par l'import JSON)", () => {
		usePlayersStore.getState().addPlayer({ name: "A" });
		const replacement = [
			{
				id: "x",
				name: "Importé",
				isFavorite: false,
				isArchived: false,
				createdAt: 0,
			},
		];

		usePlayersStore.getState().replaceAll(replacement);

		expect(usePlayersStore.getState().players).toEqual(replacement);
	});
});

describe("selectSortedPlayers", () => {
	const base = { avatarUri: undefined, createdAt: 0 };

	it("trie favoris avant non-favoris, actifs avant archivés, puis par ordre alphabétique", () => {
		const players = [
			{ ...base, id: "1", name: "Zoé", isFavorite: false, isArchived: false },
			{ ...base, id: "2", name: "Alice", isFavorite: true, isArchived: false },
			{ ...base, id: "3", name: "Bob", isFavorite: false, isArchived: true },
			{ ...base, id: "4", name: "Chloé", isFavorite: true, isArchived: false },
		];

		const sorted = selectSortedPlayers(players).map((p) => p.name);

		expect(sorted).toEqual(["Alice", "Chloé", "Zoé", "Bob"]);
	});
});

describe("migratePlayersStoreData", () => {
	it("garde les données à la version courante", () => {
		const state = { players: [] };
		expect(migratePlayersStoreData(state, PLAYERS_STORE_VERSION)).toBe(state);
	});

	it("réinitialise sur une version incompatible plutôt que de garder des données obsolètes", () => {
		expect(migratePlayersStoreData({ players: ["données obsolètes"] }, 0)).toEqual({
			players: [],
		});
	});
});
