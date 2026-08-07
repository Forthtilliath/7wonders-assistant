import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import {
	APP_ID,
	type BackupData,
	DATA_VERSION,
	ImportError,
	isBackupDataShape,
	migrateBackupData,
} from "@/lib/backupSchema";
import { useHistoryStore } from "@/stores/historyStore";
import { usePlayersStore } from "@/stores/playersStore";

export { ImportError };

function currentBackupData(): BackupData {
	return {
		app: APP_ID,
		dataVersion: DATA_VERSION,
		exportedAt: Date.now(),
		players: usePlayersStore.getState().players,
		history: useHistoryStore.getState().games,
	};
}

async function writeBackupFile(data: BackupData, name: string): Promise<File> {
	const file = new File(Paths.cache, name);
	file.create({ overwrite: true });
	file.write(JSON.stringify(data, null, 2));
	return file;
}

/** Exporte joueurs + historique dans un fichier JSON et ouvre la feuille de partage du système. */
export async function exportData(): Promise<void> {
	const file = await writeBackupFile(currentBackupData(), `7wonders-save-${Date.now()}.json`);

	if (await Sharing.isAvailableAsync()) {
		await Sharing.shareAsync(file.uri, {
			mimeType: "application/json",
			dialogTitle: "Exporter les données 7 Wonders",
		});
	}
}

/**
 * Sauvegarde silencieuse (pas de partage) de l'état actuel avant un import, au cas où le fichier
 * importé serait mauvais et qu'il faille revenir en arrière. Écrase la précédente sauvegarde de
 * secours : on ne garde qu'un seul filet de sécurité, pas un historique.
 */
async function writeSafetyBackup(): Promise<void> {
	await writeBackupFile(currentBackupData(), "before-import-safety-backup.json");
}

/** Ouvre le sélecteur de fichier système, valide le JSON et remplace les données locales. */
export async function importData(): Promise<{ players: number; history: number }> {
	const picked = await File.pickFileAsync({ mimeTypes: "application/json" });
	if (picked.canceled) throw new ImportError("Import annulé.");

	const content = await picked.result.text();
	let data: unknown;
	try {
		data = JSON.parse(content);
	} catch {
		throw new ImportError("Ce fichier n'est pas un JSON valide.");
	}

	if (!isBackupDataShape(data)) {
		throw new ImportError("Ce fichier n'est pas une sauvegarde 7 Wonders: Assistant valide.");
	}

	if (data.dataVersion > DATA_VERSION) {
		throw new ImportError(
			"Cette sauvegarde vient d'une version plus récente de l'app. Mets à jour l'app avant de l'importer.",
		);
	}

	const migrated = migrateBackupData(data);

	// Filet de sécurité : si l'import se passe mal ou que le fichier était le mauvais, on garde une
	// trace de l'état d'avant sur l'appareil (silencieuse, sans ouvrir le partage).
	await writeSafetyBackup();

	usePlayersStore.getState().replaceAll(migrated.players);
	useHistoryStore.getState().replaceAll(migrated.history);

	return { players: migrated.players.length, history: migrated.history.length };
}

/** Restaure la sauvegarde de secours écrite juste avant le dernier import. */
export async function restoreSafetyBackup(): Promise<{ players: number; history: number }> {
	const file = new File(Paths.cache, "before-import-safety-backup.json");
	if (!file.exists) {
		throw new ImportError("Aucune sauvegarde de secours disponible.");
	}

	const data = JSON.parse(await file.text());
	if (!isBackupDataShape(data)) {
		throw new ImportError("La sauvegarde de secours est corrompue.");
	}

	const migrated = migrateBackupData(data);
	usePlayersStore.getState().replaceAll(migrated.players);
	useHistoryStore.getState().replaceAll(migrated.history);

	return { players: migrated.players.length, history: migrated.history.length };
}
