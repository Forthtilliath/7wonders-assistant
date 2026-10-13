import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { type LegacyArmadaEntry, renameArmadaCategoriesInEntries } from "@/lib/armadaMigration";
import type { Game } from "@/types/game";

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
export const HISTORY_STORE_VERSION = 6;

type GameV5 = Omit<Game, "entries"> & { entries: Record<string, LegacyArmadaEntry> };
type GameV4 = Omit<Game, "entries"> & {
	entries: Record<string, Omit<LegacyArmadaEntry, "islands">>;
};

/** Exportée pour être testée isolément, sans instancier tout le store Zustand + AsyncStorage. */
export function migrateHistoryStoreData(persistedState: unknown, version: number): State {
	if (version === HISTORY_STORE_VERSION) return persistedState as State;
	if (version < 4) return { games: [] };

	let games = (persistedState as { games: GameV5[] }).games;

	if (version === 4) {
		// v4 -> v5 : ajout de la catégorie "islands" sur chaque saisie de chaque partie de
		// l'historique, plutôt que de perdre tout l'historique pour un simple champ additif.
		games = (persistedState as { games: GameV4[] }).games.map((g) => ({
			...g,
			entries: Object.fromEntries(
				Object.entries(g.entries).map(([id, entry]) => [id, { ...entry, islands: { points: 0 } }]),
			),
		}));
	}

	// v5 -> v6 : renommage des catégories Armada ("armada" -> "naval", "islands" -> "armada").
	return {
		games: games.map((g) => ({ ...g, entries: renameArmadaCategoriesInEntries(g.entries) })),
	};
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
