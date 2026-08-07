import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createId } from "@/lib/uuid";
import type { PlayerGroup } from "@/types/game";

type State = {
	groups: PlayerGroup[];
};

type Actions = {
	addGroup: (input: { name: string; playerIds: string[] }) => PlayerGroup;
	updateGroup: (id: string, patch: { name: string; playerIds: string[] }) => void;
	removeGroup: (id: string) => void;
	replaceAll: (groups: PlayerGroup[]) => void;
};

// Bump on any breaking change to PlayerGroup's shape.
export const GROUPS_STORE_VERSION = 1;

/** Exportée pour être testée isolément, sans instancier tout le store Zustand + AsyncStorage. */
export function migrateGroupsStoreData(persistedState: unknown, version: number): State {
	return version === GROUPS_STORE_VERSION ? (persistedState as State) : { groups: [] };
}

export const useGroupsStore = create<State & Actions>()(
	persist(
		(set, get) => ({
			groups: [],

			addGroup: ({ name, playerIds }) => {
				const group: PlayerGroup = {
					id: createId(),
					name: name.trim(),
					playerIds,
					createdAt: Date.now(),
				};
				set({ groups: [...get().groups, group] });
				return group;
			},

			updateGroup: (id, patch) => {
				set({
					groups: get().groups.map((g) =>
						g.id === id ? { ...g, name: patch.name.trim(), playerIds: patch.playerIds } : g,
					),
				});
			},

			removeGroup: (id) => {
				set({ groups: get().groups.filter((g) => g.id !== id) });
			},

			replaceAll: (groups) => set({ groups }),
		}),
		{
			name: "groups-store",
			storage: createJSONStorage(() => AsyncStorage),
			version: GROUPS_STORE_VERSION,
			migrate: migrateGroupsStoreData,
		},
	),
);

/** Groupes triés par ordre alphabétique. */
export function selectSortedGroups(groups: PlayerGroup[]): PlayerGroup[] {
	return [...groups].sort((a, b) => a.name.localeCompare(b.name));
}
