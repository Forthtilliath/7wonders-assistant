import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createStoreMigrate, type MigrationSteps } from "@/lib/persistedState";
import { createId } from "@/lib/uuid";
import {
	type CustomWondersPlan,
	getWonderPackNameError,
	planCustomWonders,
} from "@/lib/wonderPacks";
import { getCustomWonderNameError } from "@/lib/wonders";
import type { CustomWonder, CustomWonderPack } from "@/types/game";

type State = {
	customWonders: CustomWonder[];
	packs: CustomWonderPack[];
};

type Actions = {
	/** Ajoute une merveille perso ; `null` si le nom est refusé (cf. planCustomWonders). */
	addCustomWonder: (name: string, packId?: string) => CustomWonder | null;
	/** Ajoute plusieurs merveilles d'un coup (liste collée) ; renvoie celles ajoutées et écartées. */
	addCustomWonders: (names: readonly string[], packId?: string) => CustomWondersPlan;
	/** Corrige le nom d'une merveille perso ; `false` si le nom est refusé. Ne touche qu'à ce store :
	 * passer par `renameCustomWonderEverywhere` (lib/customWonderRename) pour corriger aussi les
	 * parties. */
	renameCustomWonder: (id: string, name: string) => boolean;
	/** Les parties déjà jouées avec cette merveille gardent son nom (stocké dans chaque saisie). */
	removeCustomWonder: (id: string) => void;
	/** Crée une extension non officielle, activée ; `null` si le nom est refusé. */
	addPack: (name: string) => CustomWonderPack | null;
	/** Renomme une extension ; `false` si le nom est refusé. */
	renamePack: (id: string, name: string) => boolean;
	/** Extensions cochées d'office au lancement d'une partie (les autres sont décochées). */
	setDefaultPackIds: (ids: readonly string[]) => void;
	/** Supprime l'extension et ses merveilles (les parties jouées gardent leurs noms). */
	removePack: (id: string) => void;
	replaceAll: (customWonders: CustomWonder[], packs: CustomWonderPack[]) => void;
};

// Bump on any breaking change to CustomWonder's or CustomWonderPack's shape, with its step in
// WONDERS_STORE_MIGRATIONS.
export const WONDERS_STORE_VERSION = 1;

/** Une étape par version (lib/persistedState) : aucune pour l'instant. */
export const WONDERS_STORE_MIGRATIONS: MigrationSteps = {};

const initialWondersState: State = { customWonders: [], packs: [] };

export const useWondersStore = create<State & Actions>()(
	persist(
		(set, get) => ({
			...initialWondersState,

			addCustomWonder: (name, packId) => {
				const { accepted } = get().addCustomWonders([name], packId);
				return accepted.length > 0 ? (get().customWonders.at(-1) ?? null) : null;
			},

			addCustomWonders: (names, packId) => {
				const { customWonders, packs } = get();
				// Une extension inconnue (supprimée entre-temps) range les merveilles hors extension.
				const validPackId = packs.some((p) => p.id === packId) ? packId : undefined;
				const plan = planCustomWonders(names, customWonders);
				const now = Date.now();
				const added: CustomWonder[] = plan.accepted.map((wonderName) => ({
					id: createId(),
					name: wonderName,
					...(validPackId && { packId: validPackId }),
					createdAt: now,
				}));
				if (added.length > 0) set({ customWonders: [...customWonders, ...added] });
				return plan;
			},

			renameCustomWonder: (id, name) => {
				const { customWonders } = get();
				if (getCustomWonderNameError(name, customWonders, id)) return false;
				set({
					customWonders: customWonders.map((w) => (w.id === id ? { ...w, name: name.trim() } : w)),
				});
				return true;
			},

			removeCustomWonder: (id) => {
				set({ customWonders: get().customWonders.filter((w) => w.id !== id) });
			},

			addPack: (name) => {
				const { packs } = get();
				if (getWonderPackNameError(name, packs)) return null;
				const pack: CustomWonderPack = {
					id: createId(),
					name: name.trim(),
					selectedByDefault: false,
					createdAt: Date.now(),
				};
				set({ packs: [...packs, pack] });
				return pack;
			},

			renamePack: (id, name) => {
				const { packs } = get();
				if (getWonderPackNameError(name, packs, id)) return false;
				set({ packs: packs.map((p) => (p.id === id ? { ...p, name: name.trim() } : p)) });
				return true;
			},

			setDefaultPackIds: (ids) => {
				set({
					packs: get().packs.map((p) => ({ ...p, selectedByDefault: ids.includes(p.id) })),
				});
			},

			removePack: (id) => {
				const { packs, customWonders } = get();
				set({
					packs: packs.filter((p) => p.id !== id),
					customWonders: customWonders.filter((w) => w.packId !== id),
				});
			},

			replaceAll: (customWonders, packs) => set({ customWonders, packs }),
		}),
		{
			name: "wonders-store",
			storage: createJSONStorage(() => AsyncStorage),
			version: WONDERS_STORE_VERSION,
			migrate: createStoreMigrate(
				"wonders-store",
				WONDERS_STORE_VERSION,
				WONDERS_STORE_MIGRATIONS,
				initialWondersState,
			),
		},
	),
);
