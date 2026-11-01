import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { EXTENSION_CATEGORIES } from "@/constants/categories";
import { type LegacyArmadaEntry, renameArmadaCategoriesInEntries } from "@/lib/armadaMigration";
import { addBabelCategoryToEntries, type PreBabelEntry } from "@/lib/babelMigration";
import { createStoreMigrate, type MigrationSteps } from "@/lib/persistedState";
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
	/** Extensions non officielles cochées : seules leurs merveilles perso sont proposées. */
	wonderPacks: string[];
	playerIds: string[];
	entries: Record<string, PlayerGameEntry>;
	startedAt: number | null;
};

type Actions = {
	startNewGame: (
		playerIds: string[],
		extensions: ExtensionId[],
		edition?: GameEdition,
		wonderPacks?: string[],
	) => void;
	updateEntry: (playerId: string, patch: (entry: PlayerGameEntry) => PlayerGameEntry) => void;
	/** Change les extensions actives d'une partie en cours (oubli à la création, par exemple). Les
	 * catégories perdues par une extension désactivée sont remises à zéro pour tous les joueurs :
	 * sinon des points déjà saisis pour une catégorie qui n'est plus affichée continueraient à
	 * compter dans le total final. */
	updateExtensions: (extensions: ExtensionId[]) => void;
	/** Change les extensions non officielles cochées : sans étape de score, rien à remettre à zéro. */
	updateWonderPacks: (wonderPacks: string[]) => void;
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
	// Une partie en cours enregistrée avant les extensions non officielles la reçoit par la fusion.
	wonderPacks: [],
	playerIds: [],
	entries: {},
	startedAt: null,
};

// Bump on any breaking change to PlayerGameEntry's shape, with its step in GAME_STORE_MIGRATIONS.
export const GAME_STORE_VERSION = 7;

type StateWithEntries<E> = Omit<State, "entries"> & { entries: Record<string, E> };

/** Une étape par version (lib/persistedState) : la partie en cours n'est jamais perdue. */
export const GAME_STORE_MIGRATIONS: MigrationSteps = {
	// v5 -> v6 : renommage des catégories Armada ("armada" -> "naval", "islands" -> "armada").
	5: (state) => {
		const old = state as StateWithEntries<LegacyArmadaEntry>;
		return { ...old, entries: renameArmadaCategoriesInEntries(old.entries) };
	},
	// v6 -> v7 : ajout de la catégorie Babel (tuiles posées).
	6: (state) => {
		const old = state as StateWithEntries<PreBabelEntry>;
		return { ...old, entries: addBabelCategoryToEntries(old.entries) };
	},
};

/** Exportée pour être testée isolément, sans instancier tout le store Zustand + AsyncStorage. */
export const migrateGameStoreData = createStoreMigrate(
	"current-game-store",
	GAME_STORE_VERSION,
	GAME_STORE_MIGRATIONS,
	initialGameState,
);

export const useGameStore = create<State & Actions>()(
	persist(
		(set, get) => ({
			...initialGameState,

			startNewGame: (playerIds, extensions, edition = "first", wonderPacks = []) => {
				const entries: Record<string, PlayerGameEntry> = {};
				for (const playerId of playerIds) {
					entries[playerId] = createEmptyPlayerGameEntry(playerId);
				}
				set({ playerIds, extensions, edition, wonderPacks, entries, startedAt: Date.now() });
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

			updateWonderPacks: (wonderPacks) => set({ wonderPacks }),

			toGame: () => {
				const { extensions, edition, wonderPacks, playerIds, entries, startedAt } = get();
				return {
					id: "",
					createdAt: startedAt ?? Date.now(),
					edition,
					extensions,
					wonderPacks,
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
