import { act, renderHook } from "@testing-library/react-native";
import { AppState, type AppStateStatus } from "react-native";
import { syncCloudBackupNow } from "@/lib/cloudBackup";
import { useBackupStore } from "@/stores/backupStore";
import { useGroupsStore } from "@/stores/groupsStore";
import { useHistoryStore } from "@/stores/historyStore";
import { usePlayersStore } from "@/stores/playersStore";
import { makeGame, makeGroup, resetAllStores, seedPlayers } from "@/test-utils/fixtures";
import { useCloudAutoBackup } from "../useCloudAutoBackup";

jest.mock("@/lib/cloudBackup", () => ({ syncCloudBackupNow: jest.fn(async () => true) }));

let appStateListener: (status: AppStateStatus) => void = () => {};

/** Monte le hook avec tous les stores déjà réhydratés (sauf indication contraire). */
async function mountHook({ hydrated = true } = {}) {
	for (const store of [usePlayersStore, useHistoryStore, useGroupsStore, useBackupStore]) {
		jest.spyOn(store.persist, "hasHydrated").mockReturnValue(hydrated);
	}
	return renderHook(() => useCloudAutoBackup());
}

const addPlayer = (name: string) => act(() => void usePlayersStore.getState().addPlayer({ name }));

describe("useCloudAutoBackup", () => {
	beforeEach(() => {
		jest.useFakeTimers();
		jest.clearAllMocks();
		resetAllStores();
		jest.spyOn(AppState, "addEventListener").mockImplementation((_type, listener) => {
			appStateListener = listener;
			return { remove: jest.fn() };
		});
	});

	afterEach(() => {
		jest.useRealTimers();
		jest.restoreAllMocks();
	});

	it("ne sauvegarde rien tant qu'aucun compte Google n'est relié", async () => {
		await mountHook();

		await addPlayer("Alice");
		await act(() => jest.advanceTimersByTime(10_000));

		expect(useBackupStore.getState().cloudSyncPending).toBe(false);
		expect(syncCloudBackupNow).not.toHaveBeenCalled();
	});

	it("regroupe les modifications rapprochées en un seul envoi, 3 s après la dernière", async () => {
		useBackupStore.getState().connectCloud("a@b.c");
		await mountHook();

		await addPlayer("Alice");
		await act(() => jest.advanceTimersByTime(2_000));
		await act(() => useHistoryStore.getState().addGame(makeGame("g1", { p1: 1 })));
		await act(() => useGroupsStore.getState().replaceAll([makeGroup("g1", "Jeudi", [])]));

		expect(useBackupStore.getState().cloudSyncPending).toBe(true);
		await act(() => jest.advanceTimersByTime(2_999));
		expect(syncCloudBackupNow).not.toHaveBeenCalled();

		await act(() => jest.advanceTimersByTime(1));
		expect(syncCloudBackupNow).toHaveBeenCalledTimes(1);
	});

	it("ignore le chargement initial des données depuis le stockage", async () => {
		useBackupStore.getState().connectCloud("a@b.c");
		await mountHook({ hydrated: false });

		await act(() => seedPlayers(["Alice"]));
		await act(() => jest.advanceTimersByTime(10_000));

		expect(syncCloudBackupNow).not.toHaveBeenCalled();
	});

	it("retente au démarrage un envoi resté en attente", async () => {
		useBackupStore.getState().connectCloud("a@b.c");
		useBackupStore.getState().markCloudPending();

		await mountHook();

		expect(syncCloudBackupNow).toHaveBeenCalledTimes(1);
	});

	it("envoie immédiatement au passage en arrière-plan, et retente au retour", async () => {
		useBackupStore.getState().connectCloud("a@b.c");
		await mountHook();

		await addPlayer("Alice");
		await act(() => appStateListener("background"));
		expect(syncCloudBackupNow).toHaveBeenCalledTimes(1);

		// Toujours en attente (envoi raté) : nouvel essai au retour dans l'app.
		await act(() => appStateListener("active"));
		expect(syncCloudBackupNow).toHaveBeenCalledTimes(2);
	});

	it("arrête de surveiller les données une fois démonté", async () => {
		useBackupStore.getState().connectCloud("a@b.c");
		const { unmount } = await mountHook();

		await addPlayer("Alice");
		await unmount();
		await act(() => jest.advanceTimersByTime(10_000));

		expect(syncCloudBackupNow).not.toHaveBeenCalled();
	});
});
