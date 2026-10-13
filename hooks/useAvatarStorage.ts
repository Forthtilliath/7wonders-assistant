import { useEffect } from "react";
import { persistLegacyAvatars, pruneUnusedAvatars } from "@/lib/avatarFiles";
import { usePlayersStore } from "@/stores/playersStore";

async function tidyAvatars(): Promise<void> {
	const updates = await persistLegacyAvatars(usePlayersStore.getState().players);
	for (const { id, avatarUri } of updates) {
		usePlayersStore.getState().updatePlayer(id, { avatarUri });
	}
	pruneUnusedAvatars(usePlayersStore.getState().players);
}

/**
 * Entretien des photos au démarrage : range dans le dossier persistant celles encore dans le cache du
 * sélecteur, puis supprime les fichiers devenus inutiles. Attend le chargement des joueurs, sans quoi
 * toutes les photos sembleraient inutilisées. À monter une seule fois, dans le layout racine.
 */
export function useAvatarStorage() {
	useEffect(() => {
		const run = () => {
			tidyAvatars().catch(() => {
				// Sans gravité : nouvel essai au prochain démarrage.
			});
		};
		if (usePlayersStore.persist.hasHydrated()) {
			run();
			return;
		}
		return usePlayersStore.persist.onFinishHydration(run);
	}, []);
}
