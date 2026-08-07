import {
	GROUPS_STORE_VERSION,
	migrateGroupsStoreData,
	selectSortedGroups,
	useGroupsStore,
} from "../groupsStore";

describe("useGroupsStore", () => {
	beforeEach(() => {
		useGroupsStore.setState({ groups: [] });
	});

	it("addGroup crée un groupe avec le nom nettoyé, ses membres, actif et non favori", () => {
		const group = useGroupsStore
			.getState()
			.addGroup({ name: "  Soirée jeudi  ", playerIds: ["p1", "p2"] });

		expect(group.name).toBe("Soirée jeudi");
		expect(group.playerIds).toEqual(["p1", "p2"]);
		expect(group.isFavorite).toBe(false);
		expect(group.isArchived).toBe(false);
		expect(useGroupsStore.getState().groups).toHaveLength(1);
	});

	it("updateGroup ne modifie que le groupe ciblé", () => {
		const a = useGroupsStore.getState().addGroup({ name: "A", playerIds: ["p1"] });
		useGroupsStore.getState().addGroup({ name: "B", playerIds: ["p2"] });

		useGroupsStore.getState().updateGroup(a.id, { name: "A modifié", playerIds: ["p1", "p3"] });

		const groups = useGroupsStore.getState().groups;
		expect(groups.find((g) => g.id === a.id)).toMatchObject({
			name: "A modifié",
			playerIds: ["p1", "p3"],
		});
		expect(groups.find((g) => g.name === "B")).toBeDefined();
	});

	it("removeGroup retire uniquement le groupe ciblé", () => {
		const a = useGroupsStore.getState().addGroup({ name: "A", playerIds: ["p1"] });
		useGroupsStore.getState().addGroup({ name: "B", playerIds: ["p2"] });

		useGroupsStore.getState().removeGroup(a.id);

		expect(useGroupsStore.getState().groups).toHaveLength(1);
		expect(useGroupsStore.getState().groups[0].name).toBe("B");
	});

	it("toggleFavorite et toggleArchived inversent l'état à chaque appel", () => {
		const a = useGroupsStore.getState().addGroup({ name: "A", playerIds: ["p1"] });

		useGroupsStore.getState().toggleFavorite(a.id);
		expect(useGroupsStore.getState().groups[0].isFavorite).toBe(true);
		useGroupsStore.getState().toggleFavorite(a.id);
		expect(useGroupsStore.getState().groups[0].isFavorite).toBe(false);

		useGroupsStore.getState().toggleArchived(a.id);
		expect(useGroupsStore.getState().groups[0].isArchived).toBe(true);
	});

	it("replaceAll écrase entièrement la liste (utilisé par l'import JSON)", () => {
		useGroupsStore.getState().addGroup({ name: "A", playerIds: ["p1"] });
		const replacement = [
			{
				id: "x",
				name: "Importé",
				playerIds: ["p9"],
				isFavorite: false,
				isArchived: false,
				createdAt: 0,
			},
		];

		useGroupsStore.getState().replaceAll(replacement);

		expect(useGroupsStore.getState().groups).toEqual(replacement);
	});
});

describe("selectSortedGroups", () => {
	const base = { playerIds: [], createdAt: 0 };

	it("trie favoris avant non-favoris, actifs avant archivés, puis par ordre alphabétique", () => {
		const groups = [
			{ ...base, id: "1", name: "Zoé", isFavorite: false, isArchived: false },
			{ ...base, id: "2", name: "Alice", isFavorite: true, isArchived: false },
			{ ...base, id: "3", name: "Bob", isFavorite: false, isArchived: true },
			{ ...base, id: "4", name: "Chloé", isFavorite: true, isArchived: false },
		];

		expect(selectSortedGroups(groups).map((g) => g.name)).toEqual(["Alice", "Chloé", "Zoé", "Bob"]);
	});
});

describe("migrateGroupsStoreData", () => {
	it("garde les données à la version courante", () => {
		const state = { groups: [] };
		expect(migrateGroupsStoreData(state, GROUPS_STORE_VERSION)).toBe(state);
	});

	it("ajoute isFavorite/isArchived aux groupes venant de la v1, sans les perdre", () => {
		const v1State = { groups: [{ id: "g1", name: "A", playerIds: ["p1"], createdAt: 0 }] };

		expect(migrateGroupsStoreData(v1State, 1)).toEqual({
			groups: [
				{
					id: "g1",
					name: "A",
					playerIds: ["p1"],
					createdAt: 0,
					isFavorite: false,
					isArchived: false,
				},
			],
		});
	});

	it("réinitialise sur une version plus ancienne encore, sans étape de migration connue", () => {
		expect(migrateGroupsStoreData({ groups: ["données obsolètes"] }, 0)).toEqual({ groups: [] });
	});
});
