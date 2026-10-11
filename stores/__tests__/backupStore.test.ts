import {
	BACKUP_STORE_VERSION,
	initialBackupState,
	migrateBackupStoreData,
	useBackupStore,
} from "../backupStore";

describe("useBackupStore", () => {
	beforeEach(() => {
		useBackupStore.setState(initialBackupState);
	});

	it("markBackedUp ne recule jamais la date de dernière sauvegarde", () => {
		useBackupStore.getState().markBackedUp(200);
		useBackupStore.getState().markBackedUp(100);
		expect(useBackupStore.getState().lastBackupAt).toBe(200);
	});

	it("un envoi Drive réussi compte comme sauvegarde et efface attente et erreur", () => {
		useBackupStore.getState().markCloudPending();
		useBackupStore.getState().setCloudError("Hors ligne");
		useBackupStore.getState().markCloudBackedUp(300);

		expect(useBackupStore.getState()).toMatchObject({
			lastBackupAt: 300,
			lastCloudBackupAt: 300,
			cloudSyncPending: false,
			cloudError: null,
		});
	});

	it("disconnectCloud oublie le compte et l'envoi en attente", () => {
		useBackupStore.getState().connectCloud("a@b.c");
		useBackupStore.getState().markCloudPending();
		useBackupStore.getState().disconnectCloud();

		expect(useBackupStore.getState()).toMatchObject({
			cloudAccount: null,
			cloudSyncPending: false,
		});
	});
});

describe("migrateBackupStoreData", () => {
	it("garde les données à la version courante", () => {
		const state = { ...initialBackupState, lastBackupAt: 1 };
		expect(migrateBackupStoreData(state, BACKUP_STORE_VERSION)).toBe(state);
	});

	it("réinitialise sur une version incompatible", () => {
		expect(migrateBackupStoreData({ autre: true }, 0)).toEqual(initialBackupState);
	});
});
