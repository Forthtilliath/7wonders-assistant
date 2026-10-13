import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { EXTENSION_CATEGORIES } from "@/constants/categories";
import { type LegacyArmadaEntry, renameArmadaCategoriesInEntries } from "@/lib/armadaMigration";
import { addBabelCategoryToEntries, type PreBabelEntry } from "@/lib/babelMigration";
import { createId } from "@/lib/uuid";
import {
	createEmptyPlayerGameEntry,
	type ExtensionId,
	type Game,
	type GameEdition,
	type PlayerGameEntry,
} from "@/types/game";
import { useHistoryStore } from "./historyStore";

type State = {
	/** null tant qu'aucune partie n'est en cours. */
	extensions: ExtensionId[];
	/** Filtre les extensions proposées en cours de partie (cf. constants/editions.ts). */
	edition: GameEdition;
	playerIds: string[];
	entries: Record<string, PlayerGameEntry>;
	startedAt: number | null;
};

type Actions = {
	startNewGame: (playerIds: string[], extensions: ExtensionId[], edition?: GameEdition) => void;
	updateEntry: (playerId: string, patch: (entry: PlayerGameEntry) => PlayerGameEntry) => void;
	/** Change les extensions actives d'une partie en cours (oubli à la création, par exemple). Les
	 * catégories perdues par une extension désactivée sont remises à zéro pour tous les joueurs :
	 * sinon des points déjà saisis pour une catégorie qui n'est plus affichée continueraient à
	 * compter dans le total final. */
	updateExtensions: (extensions: ExtensionId[]) => void;
	toGame: () => Game;
	finishGame: () => Game;
	resetGame: () => void;
	hasOngoingGame: () => boolean;
};

export const initialGameState: State = {
	extensions: [],
	// 1re édition, qui propose toutes les extensions : une partie en cours enregistrée avant le choix
	// de l'édition la reçoit par la fusion de `persist`, sans migration ni extension masquée.
	edition: "first",
	playerIds: [],
	entries: {},
	startedAt: null,
};

// Bump on any breaking change to PlayerGameEntry's shape. A version without a migration step just
// discards the in-progress game rather than crashing on stale/incompatible data.
export const GAME_STORE_VERSION = 7;

/** Exportée pour être testée isolément, sans instancier tout le store Zustand + AsyncStorage. */
export function migrateGameStoreData(persistedState: unknown, version: number): State {
	if (version === GAME_STORE_VERSION) return persistedState as State;

	if (version !== 5 && version !== 6) return initialGameState;

	// Étapes enchaînées, sans perdre la partie en cours.
	const old = persistedState as Omit<State, "entries"> & {
		entries: Record<string, LegacyArmadaEntry | PreBabelEntry>;
	};
	let entries = old.entries as Record<string, PreBabelEntry>;
	if (version === 5) {
		// v5 -> v6 : renommage des catégories Armada ("armada" -> "naval", "islands" -> "armada").
		entries = renameArmadaCategoriesInEntries(old.entries as Record<string, LegacyArmadaEntry>);
	}
	// v6 -> v7 : ajout de la catégorie Babel (tuiles posées).
	return { ...old, entries: addBabelCategoryToEntries(entries) };
}

export const useGameStore = create<State & Actions>()(
	persist(
		(set, get) => ({
			...initialGameState,

			startNewGame: (playerIds, extensions, edition = "first") => {
				const entries: Record<string, PlayerGameEntry> = {};
				for (const playerId of playerIds) {
					entries[playerId] = createEmptyPlayerGameEntry(playerId);
				}
				set({ playerIds, extensions, edition, entries, startedAt: Date.now() });
			},

			updateEntry: (playerId, patch) => {
				const current = get().entries[playerId];
				if (!current) return;
				set({
					entries: { ...get().entries, [playerId]: patch(current) },
				});
			},

			updateExtensions: (extensions) => {
				const { extensions: current, entries } = get();
				const removedExtensions = current.filter((ext) => !extensions.includes(ext));
				if (removedExtensions.length === 0) {
					set({ extensions });
					return;
				}

				const categoriesToReset = removedExtensions.flatMap((ext) => EXTENSION_CATEGORIES[ext]);
				const nextEntries: Record<string, PlayerGameEntry> = {};
				for (const [playerId, entry] of Object.entries(entries)) {
					// Valeur d'une saisie neuve plutôt qu'un `{ points: 0 }` en dur : Babel compte des tuiles.
					const empty = createEmptyPlayerGameEntry(playerId);
					let patched = entry;
					for (const category of categoriesToReset) {
						patched = { ...patched, [category]: empty[category] };
					}
					nextEntries[playerId] = patched;
				}
				set({ extensions, entries: nextEntries });
			},

			toGame: () => {
				const { extensions, edition, playerIds, entries, startedAt } = get();
				return {
					id: "",
					createdAt: startedAt ?? Date.now(),
					edition,
					extensions,
					playerIds,
					entries,
				};
			},

			finishGame: () => {
				const game: Game = { ...get().toGame(), id: createId(), finishedAt: Date.now() };
				useHistoryStore.getState().addGame(game);
				get().resetGame();
				return game;
			},

			resetGame: () => set({ ...initialGameState }),

			hasOngoingGame: () => get().playerIds.length > 0,
		}),
		{
			name: "current-game-store",
			storage: createJSONStorage(() => AsyncStorage),
			version: GAME_STORE_VERSION,
			migrate: migrateGameStoreData,
		},
	),
);
