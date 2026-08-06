import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
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
		},
	),
);
