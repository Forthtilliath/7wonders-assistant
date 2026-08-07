import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createId } from "@/lib/uuid";
import {
	createEmptyPlayerGameEntry,
	type ExtensionId,
	type Game,
	type PlayerGameEntry,
} from "@/types/game";
import { useHistoryStore } from "./historyStore";

type State = {
	/** null tant qu'aucune partie n'est en cours. */
	extensions: ExtensionId[];
	playerIds: string[];
	entries: Record<string, PlayerGameEntry>;
	startedAt: number | null;
};

type Actions = {
	startNewGame: (playerIds: string[], extensions: ExtensionId[]) => void;
	updateEntry: (playerId: string, patch: (entry: PlayerGameEntry) => PlayerGameEntry) => void;
	toGame: () => Game;
	finishGame: () => Game;
	resetGame: () => void;
	hasOngoingGame: () => boolean;
};

export const initialGameState: State = {
	extensions: [],
	playerIds: [],
	entries: {},
	startedAt: null,
};

// Bump on any breaking change to PlayerGameEntry's shape. A version mismatch just discards the
// in-progress game rather than crashing on stale/incompatible data.
export const GAME_STORE_VERSION = 4;

/** Exportée pour être testée isolément, sans instancier tout le store Zustand + AsyncStorage. */
export function migrateGameStoreData(persistedState: unknown, version: number): State {
	return version === GAME_STORE_VERSION ? (persistedState as State) : initialGameState;
}

export const useGameStore = create<State & Actions>()(
	persist(
		(set, get) => ({
			...initialGameState,

			startNewGame: (playerIds, extensions) => {
				const entries: Record<string, PlayerGameEntry> = {};
				for (const playerId of playerIds) {
					entries[playerId] = createEmptyPlayerGameEntry(playerId);
				}
				set({ playerIds, extensions, entries, startedAt: Date.now() });
			},

			updateEntry: (playerId, patch) => {
				const current = get().entries[playerId];
				if (!current) return;
				set({
					entries: { ...get().entries, [playerId]: patch(current) },
				});
			},

			toGame: () => {
				const { extensions, playerIds, entries, startedAt } = get();
				return {
					id: "",
					createdAt: startedAt ?? Date.now(),
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
