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

	it("addGroup crée un groupe avec le nom nettoyé et ses membres", () => {
		const group = useGroupsStore
			.getState()
			.addGroup({ name: "  Soirée jeudi  ", playerIds: ["p1", "p2"] });

		expect(group.name).toBe("Soirée jeudi");
		expect(group.playerIds).toEqual(["p1", "p2"]);
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

	it("replaceAll écrase entièrement la liste (utilisé par l'import JSON)", () => {
		useGroupsStore.getState().addGroup({ name: "A", playerIds: ["p1"] });
		const replacement = [{ id: "x", name: "Importé", playerIds: ["p9"], createdAt: 0 }];

		useGroupsStore.getState().replaceAll(replacement);

		expect(useGroupsStore.getState().groups).toEqual(replacement);
	});
});

describe("selectSortedGroups", () => {
	it("trie les groupes par ordre alphabétique", () => {
		const groups = [
			{ id: "1", name: "Zoé", playerIds: [], createdAt: 0 },
			{ id: "2", name: "Alice", playerIds: [], createdAt: 0 },
			{ id: "3", name: "Bob", playerIds: [], createdAt: 0 },
		];

		expect(selectSortedGroups(groups).map((g) => g.name)).toEqual(["Alice", "Bob", "Zoé"]);
	});
});

describe("migrateGroupsStoreData", () => {
	it("garde les données à la version courante", () => {
		const state = { groups: [] };
		expect(migrateGroupsStoreData(state, GROUPS_STORE_VERSION)).toBe(state);
	});

	it("réinitialise sur une version incompatible plutôt que de garder des données obsolètes", () => {
		expect(migrateGroupsStoreData({ groups: ["données obsolètes"] }, 0)).toEqual({ groups: [] });
	});
});
