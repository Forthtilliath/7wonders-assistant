import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createStoreMigrate, type MigrationSteps } from "@/lib/persistedState";

export type ThemeMode = "dark" | "light";

type State = {
	mode: ThemeMode;
};

type Actions = {
	setMode: (mode: ThemeMode) => void;
};

// Bump on any breaking change to State's shape, with its step in THEME_STORE_MIGRATIONS.
export const THEME_STORE_VERSION = 1;

/** Une étape par version (lib/persistedState) : aucune pour l'instant. */
export const THEME_STORE_MIGRATIONS: MigrationSteps = {};

/** Exportée pour être testée isolément. Réglage de l'appareil : rien à signaler s'il est perdu. */
export const migrateThemeStoreData = createStoreMigrate<State>(
	"theme-store",
	THEME_STORE_VERSION,
	THEME_STORE_MIGRATIONS,
	{ mode: "dark" },
	{ report: false },
);

export const useThemeStore = create<State & Actions>()(
	persist(
		(set) => ({
			// Sombre par défaut : c'était l'unique thème avant l'ajout du mode clair, on ne change
			// pas l'apparence des installations existantes sans action explicite de l'utilisateur.
			mode: "dark",

			setMode: (mode) => set({ mode }),
		}),
		{
			name: "theme-store",
			storage: createJSONStorage(() => AsyncStorage),
			version: THEME_STORE_VERSION,
			migrate: migrateThemeStoreData,
		},
	),
);
