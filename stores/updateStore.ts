import { usePersistHydrated } from "@forthtilliath/react-native-kit/hooks/usePersistHydrated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { APP_INFO } from "@/constants/app";
import { createStoreMigrate, type MigrationSteps } from "@/lib/persistedState";
import { isPrereleaseVersion } from "@/lib/version";

// Suivi de la vérification automatique des mises à jour (bandeau de l'onglet Jouer). Pas inclus
// dans les sauvegardes : propre à cet appareil et à la version installée.

type State = {
	/** Dernière vérification auprès de GitHub, réussie ou non : limite les appels au lancement. */
	lastCheckedAt: number | null;
	/** Version annoncée que l'utilisateur a choisi d'ignorer : plus jamais proposée par le bandeau. */
	dismissedVersion: string | null;
	/**
	 * Proposer aussi les versions de test (alpha, bêta). `null` tant que l'utilisateur n'a rien
	 * choisi : suit alors la version installée (oui sur une alpha/bêta, non sur une stable).
	 */
	prereleases: boolean | null;
};

type Actions = {
	setLastCheckedAt: (at: number) => void;
	dismissVersion: (version: string) => void;
	setPrereleases: (enabled: boolean) => void;
};

// `prereleases` ajouté sans bump : la fusion de `persist` le complète à `null` sur l'état enregistré.
export const initialUpdateState: State = {
	lastCheckedAt: null,
	dismissedVersion: null,
	prereleases: null,
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
			// Délai de 12 h remis à zéro : le bandeau tient compte du choix dès le prochain lancement.
			setPrereleases: (enabled) => set({ prereleases: enabled, lastCheckedAt: null }),
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

/** Choix effectif des versions de test : le réglage, ou à défaut le type de la version installée. */
export function resolvePrereleases(choice: boolean | null, installedVersion: string): boolean {
	return choice ?? isPrereleaseVersion(installedVersion);
}

/** Lecture ponctuelle (vérification lancée hors rendu, comme celle du bandeau). */
export function getIncludePrereleases(): boolean {
	return resolvePrereleases(useUpdateStore.getState().prereleases, APP_INFO.version);
}

export function useIncludePrereleases(): boolean {
	return resolvePrereleases(
		useUpdateStore((s) => s.prereleases),
		APP_INFO.version,
	);
}

/** `true` une fois l'état enregistré relu : avant, la vérification ignorerait le délai et la version ignorée. */
export function useUpdateStoreHydrated(): boolean {
	return usePersistHydrated(UPDATE_STORES);
}

// Tableau stable : un nouveau à chaque rendu réabonnerait le hook.
const UPDATE_STORES = [useUpdateStore];
