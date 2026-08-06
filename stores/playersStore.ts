import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createId } from "@/lib/uuid";
import type { Player } from "@/types/game";

type State = {
	players: Player[];
};

type Actions = {
	addPlayer: (input: { name: string; avatarUri?: string }) => Player;
	updatePlayer: (id: string, patch: Partial<Omit<Player, "id" | "createdAt">>) => void;
	removePlayer: (id: string) => void;
	toggleFavorite: (id: string) => void;
	toggleArchived: (id: string) => void;
	replaceAll: (players: Player[]) => void;
};

export const usePlayersStore = create<State & Actions>()(
	persist(
		(set, get) => ({
			players: [],

			addPlayer: ({ name, avatarUri }) => {
				const player: Player = {
					id: createId(),
					name: name.trim(),
					avatarUri,
					isFavorite: false,
					isArchived: false,
					createdAt: Date.now(),
				};
				set({ players: [...get().players, player] });
				return player;
			},

			updatePlayer: (id, patch) => {
				set({
					players: get().players.map((p) => (p.id === id ? { ...p, ...patch } : p)),
				});
			},

			removePlayer: (id) => {
				set({ players: get().players.filter((p) => p.id !== id) });
			},

			toggleFavorite: (id) => {
				set({
					players: get().players.map((p) =>
						p.id === id ? { ...p, isFavorite: !p.isFavorite } : p,
					),
				});
			},

			toggleArchived: (id) => {
				set({
					players: get().players.map((p) =>
						p.id === id ? { ...p, isArchived: !p.isArchived } : p,
					),
				});
			},

			replaceAll: (players) => set({ players }),
		}),
		{
			name: "players-store",
			storage: createJSONStorage(() => AsyncStorage),
			// Bump on any breaking change to Player's shape.
			version: 1,
			migrate: (_persistedState, version) => (version === 1 ? _persistedState : { players: [] }),
		},
	),
);

/** Joueurs triés : favoris puis actifs puis archivés, par ordre alphabétique dans chaque groupe. */
export function selectSortedPlayers(players: Player[]): Player[] {
	return [...players].sort((a, b) => {
		if (a.isArchived !== b.isArchived) return a.isArchived ? 1 : -1;
		if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
		return a.name.localeCompare(b.name);
	});
}
