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

	it("snoozeReminder masque le rappel jusqu'à la date donnée", () => {
		useBackupStore.getState().snoozeReminder(500);
		expect(useBackupStore.getState().reminderSnoozedUntil).toBe(500);
	});
});

describe("migrateBackupStoreData", () => {
	it("garde les données à la version courante", () => {
		const state = { reminderSnoozedUntil: 1 };
		expect(migrateBackupStoreData(state, BACKUP_STORE_VERSION)).toBe(state);
	});

	it("ne garde de la v1 que le report du rappel (le reste est repris par expo-backup)", () => {
		const v1 = { cloudAccount: { email: "a@b.c" }, lastBackupAt: 1, reminderSnoozedUntil: 99 };
		expect(migrateBackupStoreData(v1, 1)).toEqual({ reminderSnoozedUntil: 99 });
	});

	it("réinitialise sur des données illisibles", () => {
		expect(migrateBackupStoreData(null, 0)).toEqual(initialBackupState);
	});
});
