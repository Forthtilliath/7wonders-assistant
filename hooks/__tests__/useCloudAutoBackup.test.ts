import { act, renderHook } from "@testing-library/react-native";
import { backup } from "@/lib/backup";
import { useGroupsStore } from "@/stores/groupsStore";
import { useHistoryStore } from "@/stores/historyStore";
import { usePlayersStore } from "@/stores/playersStore";
import { makeGame, makeGroup, resetAllStores, seedPlayers } from "@/test-utils/fixtures";
import { useCloudAutoBackup } from "../useCloudAutoBackup";

// Délai, envoi en attente et passage en arrière-plan sont gérés (et testés) par expo-backup : ici,
// seul compte le branchement des stores de l'app sur le gestionnaire.
const mockStop = jest.fn();
jest.mock("@/lib/backup", () => ({
	backup: { start: jest.fn(() => mockStop), notifyDataChanged: jest.fn() },
}));

/** Monte le hook avec tous les stores déjà réhydratés (sauf indication contraire). */
async function mountHook({ hydrated = true } = {}) {
	for (const store of [usePlayersStore, useHistoryStore, useGroupsStore]) {
		jest.spyOn(store.persist, "hasHydrated").mockReturnValue(hydrated);
	}
	return renderHook(() => useCloudAutoBackup());
}

describe("useCloudAutoBackup", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		resetAllStores();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("démarre le gestionnaire de sauvegardes et l'arrête une fois démonté", async () => {
		const { unmount } = await mountHook();
		expect(backup.start).toHaveBeenCalledTimes(1);

		await unmount();
		expect(mockStop).toHaveBeenCalledTimes(1);
	});

	it("signale chaque modification des joueurs, de l'historique et des groupes", async () => {
		await mountHook();

		await act(() => void usePlayersStore.getState().addPlayer({ name: "Alice" }));
		await act(() => useHistoryStore.getState().addGame(makeGame("g1", { p1: 1 })));
		await act(() => useGroupsStore.getState().replaceAll([makeGroup("g1", "Jeudi", [])]));

		expect(backup.notifyDataChanged).toHaveBeenCalledTimes(3);
	});

	it("ignore le chargement initial des données depuis le stockage", async () => {
		await mountHook({ hydrated: false });

		await act(() => seedPlayers(["Alice"]));

		expect(backup.notifyDataChanged).not.toHaveBeenCalled();
	});

	it("arrête de surveiller les données une fois démonté", async () => {
		const { unmount } = await mountHook();

		await unmount();
		await act(() => void usePlayersStore.getState().addPlayer({ name: "Alice" }));

		expect(backup.notifyDataChanged).not.toHaveBeenCalled();
	});
});
