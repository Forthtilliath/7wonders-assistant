import { useEffect } from "react";
import { AppState } from "react-native";
import { syncCloudBackupNow } from "@/lib/cloudBackup";
import { useBackupStore } from "@/stores/backupStore";
import { useGroupsStore } from "@/stores/groupsStore";
import { useHistoryStore } from "@/stores/historyStore";
import { usePlayersStore } from "@/stores/playersStore";

/** Regroupe les modifications rapprochées (ex. plusieurs joueurs édités d'affilée) en un envoi. */
const DEBOUNCE_MS = 3000;

/**
 * Sauvegarde automatique sur Google Drive, sans action de l'utilisateur une fois son compte relié :
 * chaque modification des données sauvegardées (joueurs, historique, groupes) planifie un envoi.
 * Un envoi raté (hors ligne…) reste en attente et est retenté au démarrage et à chaque retour dans
 * l'app. À monter une seule fois, dans le layout racine.
 */
export function useCloudAutoBackup() {
	useEffect(() => {
		let timer: ReturnType<typeof setTimeout> | null = null;

		const flush = () => {
			if (timer) clearTimeout(timer);
			timer = null;
			void syncCloudBackupNow();
		};

		const schedule = () => {
			if (!useBackupStore.getState().cloudAccount) return;
			useBackupStore.getState().markCloudPending();
			if (timer) clearTimeout(timer);
			timer = setTimeout(flush, DEBOUNCE_MS);
		};

		const retryPending = () => {
			const { cloudAccount, cloudSyncPending } = useBackupStore.getState();
			if (cloudAccount && cloudSyncPending) flush();
		};

		// La réhydratation depuis AsyncStorage passe aussi par setState : on l'ignore (hasHydrated
		// n'est vrai qu'une fois les données chargées), seules les vraies modifications comptent.
		const unsubscribers = [
			usePlayersStore.subscribe((state, prev) => {
				if (state.players !== prev.players && usePlayersStore.persist.hasHydrated()) schedule();
			}),
			useHistoryStore.subscribe((state, prev) => {
				if (state.games !== prev.games && useHistoryStore.persist.hasHydrated()) schedule();
			}),
			useGroupsStore.subscribe((state, prev) => {
				if (state.groups !== prev.groups && useGroupsStore.persist.hasHydrated()) schedule();
			}),
		];

		if (useBackupStore.persist.hasHydrated()) {
			retryPending();
		} else {
			unsubscribers.push(useBackupStore.persist.onFinishHydration(retryPending));
		}

		// Passage en arrière-plan : on envoie tout de suite ce qui attendait la fin du délai, l'app
		// risquant d'être tuée par le système avant. Retour au premier plan : nouvel essai si besoin.
		const appStateSubscription = AppState.addEventListener("change", (status) => {
			if (status === "background" && timer) flush();
			if (status === "active") retryPending();
		});

		return () => {
			for (const unsubscribe of unsubscribers) unsubscribe();
			appStateSubscription.remove();
			if (timer) clearTimeout(timer);
		};
	}, []);
}
