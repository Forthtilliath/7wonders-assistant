import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import {
	APP_ID,
	type BackupData,
	DATA_VERSION,
	ImportError,
	isBackupDataShape,
	migrateBackupData,
	validateMigratedBackupData,
} from "@/lib/backupSchema";
import { buildGamesCsv } from "@/lib/csv";
import { useGroupsStore } from "@/stores/groupsStore";
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
		groups: useGroupsStore.getState().groups,
	};
}

async function writeTextFile(content: string, name: string): Promise<File> {
	const file = new File(Paths.cache, name);
	file.create({ overwrite: true });
	file.write(content);
	return file;
}

async function writeBackupFile(data: BackupData, name: string): Promise<File> {
	return writeTextFile(JSON.stringify(data, null, 2), name);
}

async function shareFile(file: File, mimeType: string, dialogTitle: string): Promise<void> {
	if (await Sharing.isAvailableAsync()) {
		await Sharing.shareAsync(file.uri, { mimeType, dialogTitle });
	}
}

/** Exporte joueurs + historique dans un fichier JSON et ouvre la feuille de partage du système. */
export async function exportData(): Promise<void> {
	const file = await writeBackupFile(currentBackupData(), `7wonders-save-${Date.now()}.json`);
	await shareFile(file, "application/json", "Exporter les données 7 Wonders");
}

/**
 * Exporte l'historique des parties en CSV (une ligne par joueur par partie), pour l'ouvrir dans un
 * tableur. Ne contient pas les joueurs/groupes eux-mêmes : c'est un export de lecture, pas une
 * sauvegarde (utiliser `exportData` pour ça).
 */
export async function exportGamesCsv(): Promise<void> {
	const csv = buildGamesCsv(useHistoryStore.getState().games, usePlayersStore.getState().players);
	const file = await writeTextFile(csv, `7wonders-scores-${Date.now()}.csv`);
	await shareFile(file, "text/csv", "Exporter les scores en CSV");
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
export async function importData(): Promise<{ players: number; history: number; groups: number }> {
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

	const migrated = validateMigratedBackupData(migrateBackupData(data));

	// Filet de sécurité : si l'import se passe mal ou que le fichier était le mauvais, on garde une
	// trace de l'état d'avant sur l'appareil (silencieuse, sans ouvrir le partage).
	await writeSafetyBackup();

	usePlayersStore.getState().replaceAll(migrated.players);
	useHistoryStore.getState().replaceAll(migrated.history);
	useGroupsStore.getState().replaceAll(migrated.groups);

	return {
		players: migrated.players.length,
		history: migrated.history.length,
		groups: migrated.groups.length,
	};
}

/** Restaure la sauvegarde de secours écrite juste avant le dernier import. */
export async function restoreSafetyBackup(): Promise<{
	players: number;
	history: number;
	groups: number;
}> {
	const file = new File(Paths.cache, "before-import-safety-backup.json");
	if (!file.exists) {
		throw new ImportError("Aucune sauvegarde de secours disponible.");
	}

	const data = JSON.parse(await file.text());
	if (!isBackupDataShape(data)) {
		throw new ImportError("La sauvegarde de secours est corrompue.");
	}

	const migrated = validateMigratedBackupData(migrateBackupData(data));
	usePlayersStore.getState().replaceAll(migrated.players);
	useHistoryStore.getState().replaceAll(migrated.history);
	useGroupsStore.getState().replaceAll(migrated.groups);

	return {
		players: migrated.players.length,
		history: migrated.history.length,
		groups: migrated.groups.length,
	};
}
