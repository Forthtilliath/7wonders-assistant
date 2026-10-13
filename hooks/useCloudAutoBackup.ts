import { useAutoBackup } from "@forthtilliath/expo-backup-ui/hooks";
import { useEffect } from "react";
import { backup } from "@/lib/backup";
import { useGroupsStore } from "@/stores/groupsStore";
import { useHistoryStore } from "@/stores/historyStore";
import { usePlayersStore } from "@/stores/playersStore";
import { useWondersStore } from "@/stores/wondersStore";

/**
 * Sauvegarde automatique sur Google Drive, sans action de l'utilisateur une fois son compte relié :
 * démarre le gestionnaire (envoi en attente retenté au démarrage et au retour dans l'app) et lui
 * signale chaque modification des données sauvegardées (joueurs, historique, groupes,
 * merveilles perso). À monter une
 * seule fois, dans le layout racine.
 */
export function useCloudAutoBackup() {
	useAutoBackup(backup);

	useEffect(() => {
		// La réhydratation depuis AsyncStorage passe aussi par setState : on l'ignore (hasHydrated
		// n'est vrai qu'une fois les données chargées), seules les vraies modifications comptent.
		const unsubscribers = [
			usePlayersStore.subscribe((state, prev) => {
				if (state.players !== prev.players && usePlayersStore.persist.hasHydrated()) {
					backup.notifyDataChanged();
				}
			}),
			useHistoryStore.subscribe((state, prev) => {
				if (state.games !== prev.games && useHistoryStore.persist.hasHydrated()) {
					backup.notifyDataChanged();
				}
			}),
			useGroupsStore.subscribe((state, prev) => {
				if (state.groups !== prev.groups && useGroupsStore.persist.hasHydrated()) {
					backup.notifyDataChanged();
				}
			}),
			useWondersStore.subscribe((state, prev) => {
				const changed = state.customWonders !== prev.customWonders || state.packs !== prev.packs;
				if (changed && useWondersStore.persist.hasHydrated()) {
					backup.notifyDataChanged();
				}
			}),
		];

		return () => {
			for (const unsubscribe of unsubscribers) unsubscribe();
		};
	}, []);
}
