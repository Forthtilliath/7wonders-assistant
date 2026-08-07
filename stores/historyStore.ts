import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Game, PlayerGameEntry } from "@/types/game";

type State = {
	games: Game[];
};

type Actions = {
	addGame: (game: Game) => void;
	removeGame: (id: string) => void;
	clearHistory: () => void;
	replaceAll: (games: Game[]) => void;
};

// Bump on any breaking change to Game/PlayerGameEntry's shape.
export const HISTORY_STORE_VERSION = 5;

type GameV4 = Omit<Game, "entries"> & {
	entries: Record<string, Omit<PlayerGameEntry, "islands">>;
};

/** Exportée pour être testée isolément, sans instancier tout le store Zustand + AsyncStorage. */
export function migrateHistoryStoreData(persistedState: unknown, version: number): State {
	if (version === HISTORY_STORE_VERSION) return persistedState as State;

	if (version === 4) {
		// v4 -> v5 : ajout de la catégorie "islands" sur chaque saisie de chaque partie de
		// l'historique, plutôt que de perdre tout l'historique pour un simple champ additif.
		const old = persistedState as { games: GameV4[] };
		return {
			games: old.games.map((g) => ({
				...g,
				entries: Object.fromEntries(
					Object.entries(g.entries).map(([id, entry]) => [
						id,
						{ ...entry, islands: { points: 0 } },
					]),
				),
			})),
		};
	}

	return { games: [] };
}

export const useHistoryStore = create<State & Actions>()(
	persist(
		(set, get) => ({
			games: [],

			addGame: (game) => set({ games: [game, ...get().games] }),

			removeGame: (id) => set({ games: get().games.filter((g) => g.id !== id) }),

			clearHistory: () => set({ games: [] }),

			replaceAll: (games) => set({ games }),
		}),
		{
			name: "history-store",
			storage: createJSONStorage(() => AsyncStorage),
			version: HISTORY_STORE_VERSION,
			migrate: migrateHistoryStoreData,
		},
	),
);
