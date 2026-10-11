import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type State = {
	/** Compte Google relié pour la sauvegarde automatique sur Drive, null si non activée. */
	cloudAccount: { email: string } | null;
	/** Dernière sauvegarde réussie, tous moyens confondus (export JSON, Google Drive, import). */
	lastBackupAt: number | null;
	lastCloudBackupAt: number | null;
	/** Des données ont changé depuis le dernier envoi réussi sur Drive (ex. hors ligne). */
	cloudSyncPending: boolean;
	/** Message de la dernière erreur d'envoi sur Drive, effacé au prochain envoi réussi. */
	cloudError: string | null;
	/** Le rappel de sauvegarde reste masqué jusqu'à cette date ("Plus tard"). */
	reminderSnoozedUntil: number | null;
};

type Actions = {
	connectCloud: (email: string) => void;
	disconnectCloud: () => void;
	/** Enregistre une sauvegarde faite à `at` (n'écrase pas une date plus récente). */
	markBackedUp: (at: number) => void;
	markCloudBackedUp: (at: number) => void;
	markCloudPending: () => void;
	setCloudError: (message: string) => void;
	snoozeReminder: (until: number) => void;
};

export const initialBackupState: State = {
	cloudAccount: null,
	lastBackupAt: null,
	lastCloudBackupAt: null,
	cloudSyncPending: false,
	cloudError: null,
	reminderSnoozedUntil: null,
};

// Bump on any breaking change to State's shape.
export const BACKUP_STORE_VERSION = 1;

/** Exportée pour être testée isolément, sans instancier tout le store Zustand + AsyncStorage. */
export function migrateBackupStoreData(persistedState: unknown, version: number): State {
	return version === BACKUP_STORE_VERSION ? (persistedState as State) : initialBackupState;
}

export const useBackupStore = create<State & Actions>()(
	persist(
		(set, get) => ({
			...initialBackupState,

			connectCloud: (email) => set({ cloudAccount: { email }, cloudError: null }),

			disconnectCloud: () => set({ cloudAccount: null, cloudSyncPending: false, cloudError: null }),

			markBackedUp: (at) => set({ lastBackupAt: Math.max(at, get().lastBackupAt ?? 0) }),

			markCloudBackedUp: (at) => {
				get().markBackedUp(at);
				set({ lastCloudBackupAt: at, cloudSyncPending: false, cloudError: null });
			},

			markCloudPending: () => set({ cloudSyncPending: true }),

			setCloudError: (message) => set({ cloudError: message }),

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
