import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createId } from "@/lib/uuid";
import { getCustomWonderNameError } from "@/lib/wonders";
import type { CustomWonder } from "@/types/game";

type State = {
	customWonders: CustomWonder[];
};

type Actions = {
	/** Ajoute une merveille perso ; `null` si le nom est refusé (cf. getCustomWonderNameError). */
	addCustomWonder: (name: string) => CustomWonder | null;
	/** Les parties déjà jouées avec cette merveille gardent son nom (stocké dans chaque saisie). */
	removeCustomWonder: (id: string) => void;
	replaceAll: (customWonders: CustomWonder[]) => void;
};

// Bump on any breaking change to CustomWonder's shape.
export const WONDERS_STORE_VERSION = 1;

export const useWondersStore = create<State & Actions>()(
	persist(
		(set, get) => ({
			customWonders: [],

			addCustomWonder: (name) => {
				const { customWonders } = get();
				if (getCustomWonderNameError(name, customWonders)) return null;
				const wonder: CustomWonder = { id: createId(), name: name.trim(), createdAt: Date.now() };
				set({ customWonders: [...customWonders, wonder] });
				return wonder;
			},

			removeCustomWonder: (id) => {
				set({ customWonders: get().customWonders.filter((w) => w.id !== id) });
			},

			replaceAll: (customWonders) => set({ customWonders }),
		}),
		{
			name: "wonders-store",
			storage: createJSONStorage(() => AsyncStorage),
			version: WONDERS_STORE_VERSION,
		},
	),
);
