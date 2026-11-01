import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createStoreMigrate, type MigrationSteps } from "@/lib/persistedState";

// L'état des sauvegardes elles-mêmes (compte Google relié, dernières dates, envoi en attente…) est
// tenu par `backup` (lib/backup.ts, @forthtilliath/expo-backup) : il ne reste ici que le rappel.

type State = {
	/** Le rappel de sauvegarde reste masqué jusqu'à cette date ("Plus tard"). */
	reminderSnoozedUntil: number | null;
};

type Actions = {
	snoozeReminder: (until: number) => void;
};

export const initialBackupState: State = {
	reminderSnoozedUntil: null,
};

// Bump on any breaking change to State's shape, with its step in BACKUP_STORE_MIGRATIONS.
export const BACKUP_STORE_VERSION = 2;

/** Une étape par version (lib/persistedState). */
export const BACKUP_STORE_MIGRATIONS: MigrationSteps = {
	// v1 -> v2 : v1 tenait aussi l'état des sauvegardes, repris depuis par expo-backup : seul le
	// report du rappel est conservé.
	1: (state) => {
		const snoozed = (state as { reminderSnoozedUntil?: unknown }).reminderSnoozedUntil;
		return { reminderSnoozedUntil: typeof snoozed === "number" ? snoozed : null };
	},
};

/** Exportée pour être testée isolément. Réglage de l'appareil : rien à signaler s'il est perdu. */
export const migrateBackupStoreData = createStoreMigrate(
	"backup-store",
	BACKUP_STORE_VERSION,
	BACKUP_STORE_MIGRATIONS,
	initialBackupState,
	{ report: false },
);

export const useBackupStore = create<State & Actions>()(
	persist(
		(set) => ({
			...initialBackupState,

			snoozeReminder: (until) => set({ reminderSnoozedUntil: until }),
		}),
		{
			name: "backup-store",
			storage: createJSONStorage(() => AsyncStorage),
			version: BACKUP_STORE_VERSION,
			migrate: migrateBackupStoreData,
		},
	),
);
