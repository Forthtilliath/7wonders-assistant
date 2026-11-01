import { usePersistHydrated } from "@forthtilliath/react-native-kit/hooks/usePersistHydrated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createStoreMigrate, type MigrationSteps } from "@/lib/persistedState";

// Suivi de la vérification automatique des mises à jour (bandeau de l'onglet Jouer). Pas inclus
// dans les sauvegardes : propre à cet appareil et à la version installée.

type State = {
	/** Dernière vérification auprès de GitHub, réussie ou non : limite les appels au lancement. */
	lastCheckedAt: number | null;
	/** Version annoncée que l'utilisateur a choisi d'ignorer : plus jamais proposée par le bandeau. */
	dismissedVersion: string | null;
};

type Actions = {
	setLastCheckedAt: (at: number) => void;
	dismissVersion: (version: string) => void;
};

export const initialUpdateState: State = {
	lastCheckedAt: null,
	dismissedVersion: null,
};

// Bump on any breaking change to State's shape, with its step in UPDATE_STORE_MIGRATIONS.
export const UPDATE_STORE_VERSION = 1;

/** Une étape par version (lib/persistedState) : aucune pour l'instant. */
export const UPDATE_STORE_MIGRATIONS: MigrationSteps = {};

export const useUpdateStore = create<State & Actions>()(
	persist(
		(set) => ({
			...initialUpdateState,

			setLastCheckedAt: (at) => set({ lastCheckedAt: at }),
			dismissVersion: (version) => set({ dismissedVersion: version }),
		}),
		{
			name: "update-store",
			storage: createJSONStorage(() => AsyncStorage),
			version: UPDATE_STORE_VERSION,
			// Réglage de l'appareil : rien à signaler s'il est perdu.
			migrate: createStoreMigrate(
				"update-store",
				UPDATE_STORE_VERSION,
				UPDATE_STORE_MIGRATIONS,
				initialUpdateState,
				{ report: false },
			),
		},
	),
);

/** `true` une fois l'état enregistré relu : avant, la vérification ignorerait le délai et la version ignorée. */
export function useUpdateStoreHydrated(): boolean {
	return usePersistHydrated(UPDATE_STORES);
}

// Tableau stable : un nouveau à chaque rendu réabonnerait le hook.
const UPDATE_STORES = [useUpdateStore];
