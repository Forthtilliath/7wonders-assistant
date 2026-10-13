import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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

// Bump on any breaking change to State's shape.
export const BACKUP_STORE_VERSION = 2;

/** Exportée pour être testée isolément, sans instancier tout le store Zustand + AsyncStorage. */
export function migrateBackupStoreData(persistedState: unknown, version: number): State {
	if (version === BACKUP_STORE_VERSION) return persistedState as State;
	// v1 tenait aussi l'état des sauvegardes, repris depuis par expo-backup : seul le report du
	// rappel est conservé.
	const snoozed = (persistedState as { reminderSnoozedUntil?: unknown } | null)
		?.reminderSnoozedUntil;
	return { reminderSnoozedUntil: typeof snoozed === "number" ? snoozed : null };
}

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
