import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { keepAvailableExtensions } from "@/constants/editions";
import type { ExtensionId, GameEdition } from "@/types/game";

type State = {
	/** Extensions pré-cochées à la création d'une nouvelle partie (le groupe joue souvent avec). */
	defaultExtensions: ExtensionId[];
	/** Édition pré-choisie : filtre les extensions proposées (Babel n'existe qu'en 1re édition). */
	defaultEdition: GameEdition;
};

type Actions = {
	setDefaultExtensions: (extensions: ExtensionId[]) => void;
	/** Change l'édition et décoche les extensions par défaut qu'elle ne propose pas. */
	setDefaultEdition: (edition: GameEdition) => void;
};

// 1re édition par défaut : elle propose toutes les extensions, rien n'est décoché aux préférences
// enregistrées avant le choix de l'édition (complétées par la fusion de `persist`, sans migration).
const initialPreferencesState: State = { defaultExtensions: [], defaultEdition: "first" };

// Bump on any breaking change to State's shape.
export const PREFERENCES_STORE_VERSION = 1;

/** Exportée pour être testée isolément, sans instancier tout le store Zustand + AsyncStorage. */
export function migratePreferencesStoreData(persistedState: unknown, version: number): State {
	return version === PREFERENCES_STORE_VERSION
		? (persistedState as State)
		: initialPreferencesState;
}

export const usePreferencesStore = create<State & Actions>()(
	persist(
		(set, get) => ({
			...initialPreferencesState,

			setDefaultExtensions: (extensions) => set({ defaultExtensions: extensions }),
			setDefaultEdition: (edition) =>
				set({
					defaultEdition: edition,
					defaultExtensions: keepAvailableExtensions(get().defaultExtensions, edition),
				}),
		}),
		{
			name: "preferences-store",
			storage: createJSONStorage(() => AsyncStorage),
			version: PREFERENCES_STORE_VERSION,
			migrate: migratePreferencesStoreData,
		},
	),
);
