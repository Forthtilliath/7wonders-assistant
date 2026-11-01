import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { type LegacyArmadaEntry, renameArmadaCategoriesInEntries } from "@/lib/armadaMigration";
import { addBabelCategoryToEntries, type PreBabelEntry } from "@/lib/babelMigration";
import { createStoreMigrate, type MigrationSteps } from "@/lib/persistedState";
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

// Bump on any breaking change to Game/PlayerGameEntry's shape, with its step in
// HISTORY_STORE_MIGRATIONS.
export const HISTORY_STORE_VERSION = 7;

type GameV6 = Omit<Game, "entries"> & { entries: Record<string, PreBabelEntry> };
type GameV5 = Omit<Game, "entries"> & { entries: Record<string, LegacyArmadaEntry> };
type GameV4 = Omit<Game, "entries"> & {
	entries: Record<string, Omit<LegacyArmadaEntry, "islands">>;
};

/** Une étape par version (lib/persistedState) : l'historique n'est jamais perdu. */
export const HISTORY_STORE_MIGRATIONS: MigrationSteps = {
	// v4 -> v5 : ajout de la catégorie "islands" sur chaque saisie de chaque partie.
	4: (state) => ({
		games: (state as { games: GameV4[] }).games.map(
			(g): GameV5 => ({
				...g,
				entries: Object.fromEntries(
					Object.entries(g.entries).map(([id, entry]) => [
						id,
						{ ...entry, islands: { points: 0 } },
					]),
				),
			}),
		),
	}),
	// v5 -> v6 : renommage des catégories Armada ("armada" -> "naval", "islands" -> "armada").
	5: (state) => ({
		games: (state as { games: GameV5[] }).games.map(
			(g): GameV6 => ({ ...g, entries: renameArmadaCategoriesInEntries(g.entries) }),
		),
	}),
	// v6 -> v7 : ajout de la catégorie Babel.
	6: (state) => ({
		games: (state as { games: GameV6[] }).games.map(
			(g): Game => ({ ...g, entries: addBabelCategoryToEntries(g.entries) }),
		),
	}),
};

/** Exportée pour être testée isolément, sans instancier tout le store Zustand + AsyncStorage. */
export const migrateHistoryStoreData = createStoreMigrate<State>(
	"history-store",
	HISTORY_STORE_VERSION,
	HISTORY_STORE_MIGRATIONS,
	{ games: [] },
);

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
