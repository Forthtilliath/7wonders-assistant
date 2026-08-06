import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useHistoryStore } from "@/stores/historyStore";
import { usePlayersStore } from "@/stores/playersStore";
import type { Game, Player } from "@/types/game";

const APP_ID = "7wonders-assistant";
const DATA_VERSION = 1;

type BackupData = {
	app: typeof APP_ID;
	dataVersion: number;
	exportedAt: number;
	players: Player[];
	history: Game[];
};

/** Exporte joueurs + historique dans un fichier JSON et ouvre la feuille de partage du système. */
export async function exportData(): Promise<void> {
	const data: BackupData = {
		app: APP_ID,
		dataVersion: DATA_VERSION,
		exportedAt: Date.now(),
		players: usePlayersStore.getState().players,
		history: useHistoryStore.getState().games,
	};

	const file = new File(Paths.cache, `7wonders-save-${Date.now()}.json`);
	file.create({ overwrite: true });
	file.write(JSON.stringify(data, null, 2));

	if (await Sharing.isAvailableAsync()) {
		await Sharing.shareAsync(file.uri, {
			mimeType: "application/json",
			dialogTitle: "Exporter les données 7 Wonders",
		});
	}
}

export class ImportError extends Error {}

/** Ouvre le sélecteur de fichier système, valide le JSON et remplace les données locales. */
export async function importData(): Promise<{ players: number; history: number }> {
	const picked = await File.pickFileAsync({ mimeTypes: "application/json" });
	if (picked.canceled) throw new ImportError("Import annulé.");

	const content = await picked.result.text();
	let data: Partial<BackupData>;
	try {
		data = JSON.parse(content);
	} catch {
		throw new ImportError("Ce fichier n'est pas un JSON valide.");
	}

	if (data.app !== APP_ID || !Array.isArray(data.players) || !Array.isArray(data.history)) {
		throw new ImportError("Ce fichier n'est pas une sauvegarde 7 Wonders: Assistant valide.");
	}

	usePlayersStore.getState().replaceAll(data.players);
	useHistoryStore.getState().replaceAll(data.history);

	return { players: data.players.length, history: data.history.length };
}
