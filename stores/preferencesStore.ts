import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ExtensionId } from "@/types/game";

type State = {
	/** Extensions pré-cochées à la création d'une nouvelle partie (le groupe joue souvent avec). */
	defaultExtensions: ExtensionId[];
};

type Actions = {
	setDefaultExtensions: (extensions: ExtensionId[]) => void;
};

// Bump on any breaking change to State's shape.
export const PREFERENCES_STORE_VERSION = 1;

/** Exportée pour être testée isolément, sans instancier tout le store Zustand + AsyncStorage. */
export function migratePreferencesStoreData(persistedState: unknown, version: number): State {
	return version === PREFERENCES_STORE_VERSION
		? (persistedState as State)
		: { defaultExtensions: [] };
}

export const usePreferencesStore = create<State & Actions>()(
	persist(
		(set) => ({
			defaultExtensions: [],

			setDefaultExtensions: (extensions) => set({ defaultExtensions: extensions }),
		}),
		{
			name: "preferences-store",
			storage: createJSONStorage(() => AsyncStorage),
			version: PREFERENCES_STORE_VERSION,
			migrate: migratePreferencesStoreData,
		},
	),
);
