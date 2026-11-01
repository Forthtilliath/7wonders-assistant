import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { keepAvailableExtensions } from "@/constants/editions";
import { createStoreMigrate, type MigrationSteps } from "@/lib/persistedState";
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

// Bump on any breaking change to State's shape, with its step in PREFERENCES_STORE_MIGRATIONS.
export const PREFERENCES_STORE_VERSION = 1;

/** Une étape par version (lib/persistedState) : aucune pour l'instant. */
export const PREFERENCES_STORE_MIGRATIONS: MigrationSteps = {};

/** Exportée pour être testée isolément. Réglage de l'appareil : rien à signaler s'il est perdu. */
export const migratePreferencesStoreData = createStoreMigrate(
	"preferences-store",
	PREFERENCES_STORE_VERSION,
	PREFERENCES_STORE_MIGRATIONS,
	initialPreferencesState,
	{ report: false },
);

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
