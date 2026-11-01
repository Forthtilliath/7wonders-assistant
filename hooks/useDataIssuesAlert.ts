import { usePersistHydrated } from "@forthtilliath/react-native-kit/hooks/usePersistHydrated";
import { useEffect } from "react";
import { Alert, type AlertButton } from "react-native";
import { describeDataIssues, rescueCopyUris } from "@/lib/dataIssues";
import { exportRescueCopies } from "@/lib/rescueCopies";
import { useDataIssuesStore } from "@/stores/dataIssuesStore";
import { useGameStore } from "@/stores/gameStore";
import { useGroupsStore } from "@/stores/groupsStore";
import { useHistoryStore } from "@/stores/historyStore";
import { usePlayersStore } from "@/stores/playersStore";
import { useWondersStore } from "@/stores/wondersStore";

// Tableau stable : un nouveau à chaque rendu réabonnerait le hook.
const DATA_STORES = [
	useGameStore,
	usePlayersStore,
	useGroupsStore,
	useHistoryStore,
	useWondersStore,
];

function exportCopies(uris: string[]) {
	exportRescueCopies(uris).catch((error: unknown) => {
		Alert.alert("Export impossible", error instanceof Error ? error.message : String(error));
	});
}

/**
 * Prévient l'utilisateur, une fois tous les stores relus (une seule alerte pour tous), des données
 * qui n'ont pas pu être reprises (stores/dataIssuesStore), avec l'export de leur copie de secours.
 * À monter une seule fois, dans le layout racine.
 */
export function useDataIssuesAlert() {
	const hydrated = usePersistHydrated(DATA_STORES);
	const issues = useDataIssuesStore((s) => s.issues);

	useEffect(() => {
		if (!hydrated || issues.length === 0) return;
		useDataIssuesStore.getState().clear();
		const uris = rescueCopyUris(issues);
		const buttons: AlertButton[] = [{ text: "Plus tard", style: "cancel" }];
		if (uris.length > 0)
			buttons.push({ text: "Exporter la copie", onPress: () => exportCopies(uris) });
		Alert.alert("Données non reprises", describeDataIssues(issues), buttons);
	}, [hydrated, issues]);
}
