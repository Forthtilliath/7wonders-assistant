import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getGameRanking } from "@/lib/scoring/game";
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
	getRanking: () => ReturnType<typeof getGameRanking>;
	finishGame: () => Game;
	resetGame: () => void;
	hasOngoingGame: () => boolean;
};

const initialState: State = {
	extensions: [],
	playerIds: [],
	entries: {},
	startedAt: null,
};

export const useGameStore = create<State & Actions>()(
	persist(
		(set, get) => ({
			...initialState,

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

			getRanking: () => getGameRanking(get().toGame()),

			finishGame: () => {
				const game: Game = { ...get().toGame(), id: createId(), finishedAt: Date.now() };
				useHistoryStore.getState().addGame(game);
				get().resetGame();
				return game;
			},

			resetGame: () => set({ ...initialState }),

			hasOngoingGame: () => get().playerIds.length > 0,
		}),
		{
			name: "current-game-store",
			storage: createJSONStorage(() => AsyncStorage),
			// Bump on any breaking change to PlayerGameEntry's shape. A version mismatch just
			// discards the in-progress game rather than crashing on stale/incompatible data.
			version: 1,
			migrate: (_persistedState, version) => (version === 1 ? _persistedState : initialState),
		},
	),
);
