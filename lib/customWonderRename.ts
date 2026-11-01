import { getCustomWonderNameError } from "@/lib/wonders";
import { useGameStore } from "@/stores/gameStore";
import { useHistoryStore } from "@/stores/historyStore";
import { useWondersStore } from "@/stores/wondersStore";

/**
 * Corrige le nom d'une merveille perso (faute de frappe) partout : dans ses merveilles, dans les
 * parties de l'historique et dans la partie en cours, pour que ses statistiques restent sous un seul
 * nom. Renvoie la raison du refus (nom vide, doublon…), `null` si le nom a été changé.
 */
export function renameCustomWonderEverywhere(id: string, name: string): string | null {
	const { customWonders, renameCustomWonder } = useWondersStore.getState();
	const wonder = customWonders.find((w) => w.id === id);
	if (!wonder) return "Merveille introuvable.";
	const error = getCustomWonderNameError(name, customWonders, id);
	if (error) return error;

	const from = wonder.name;
	const to = name.trim();
	if (from === to) return null;
	renameCustomWonder(id, to);
	useHistoryStore.getState().renameWonder(from, to);
	useGameStore.getState().renameWonder(from, to);
	return null;
}
