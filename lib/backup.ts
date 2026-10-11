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
import { useBackupStore } from "@/stores/backupStore";
import { useGroupsStore } from "@/stores/groupsStore";
import { useHistoryStore } from "@/stores/historyStore";
import { usePlayersStore } from "@/stores/playersStore";
import type { Game } from "@/types/game";

export { ImportError };

export type BackupSummary = { players: number; history: number; groups: number };

export function currentBackupData(): BackupData {
	return {
		app: APP_ID,
		dataVersion: DATA_VERSION,
		exportedAt: Date.now(),
		players: usePlayersStore.getState().players,
		history: useHistoryStore.getState().games,
		groups: useGroupsStore.getState().groups,
	};
}

export function serializeBackup(data: BackupData): string {
	return JSON.stringify(data, null, 2);
}

export function summarizeBackup(data: BackupData): BackupSummary {
	return { players: data.players.length, history: data.history.length, groups: data.groups.length };
}

/**
 * Valide le contenu texte d'une sauvegarde (fichier importé ou copie Google Drive) et le migre
 * vers la version courante du format. Lève une `ImportError` au message affichable sinon.
 */
export function parseBackupContent(content: string): BackupData {
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

	return validateMigratedBackupData(migrateBackupData(data));
}

async function writeTextFile(content: string, name: string): Promise<File> {
	const file = new File(Paths.cache, name);
	file.create({ overwrite: true });
	file.write(content);
	return file;
}

async function writeBackupFile(data: BackupData, name: string): Promise<File> {
	return writeTextFile(serializeBackup(data), name);
}

async function shareFile(file: File, mimeType: string, dialogTitle: string): Promise<void> {
	if (await Sharing.isAvailableAsync()) {
		await Sharing.shareAsync(file.uri, { mimeType, dialogTitle });
	}
}

function replaceStores(data: BackupData): BackupSummary {
	usePlayersStore.getState().replaceAll(data.players);
	useHistoryStore.getState().replaceAll(data.history);
	useGroupsStore.getState().replaceAll(data.groups);
	return summarizeBackup(data);
}

/**
 * Exporte joueurs + historique dans un fichier JSON et ouvre la feuille de partage du système.
 * Compte comme une sauvegarde pour le rappel, même si l'utilisateur ferme le partage sans choisir
 * de destination : le système ne permet pas de distinguer les deux cas.
 */
export async function exportData(): Promise<void> {
	const data = currentBackupData();
	const file = await writeBackupFile(data, `7wonders-save-${data.exportedAt}.json`);
	await shareFile(file, "application/json", "Exporter les données 7 Wonders");
	useBackupStore.getState().markBackedUp(data.exportedAt);
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

/** Même export CSV, limité à une seule partie (partage du résultat d'une soirée). */
export async function exportGameCsv(game: Game): Promise<void> {
	const csv = buildGamesCsv([game], usePlayersStore.getState().players);
	const file = await writeTextFile(csv, `7wonders-partie-${game.createdAt}.csv`);
	await shareFile(file, "text/csv", "Partager la partie en CSV");
}

/**
 * Sauvegarde silencieuse (pas de partage) de l'état actuel avant un import, au cas où le fichier
 * importé serait mauvais et qu'il faille revenir en arrière. Écrase la précédente sauvegarde de
 * secours : on ne garde qu'un seul filet de sécurité, pas un historique.
 */
async function writeSafetyBackup(): Promise<void> {
	await writeBackupFile(currentBackupData(), "before-import-safety-backup.json");
}

/**
 * Remplace les données locales par une sauvegarde déjà validée (fichier importé ou Google Drive),
 * après avoir gardé une sauvegarde de secours de l'état actuel. Les parties restaurées existent
 * déjà ailleurs : elles sont considérées comme sauvegardées pour le rappel.
 */
export async function applyBackupData(data: BackupData): Promise<BackupSummary> {
	// Filet de sécurité : si l'import se passe mal ou que le fichier était le mauvais, on garde une
	// trace de l'état d'avant sur l'appareil (silencieuse, sans ouvrir le partage).
	await writeSafetyBackup();
	const summary = replaceStores(data);
	useBackupStore.getState().markBackedUp(data.exportedAt);
	return summary;
}

/** Ouvre le sélecteur de fichier système, valide le JSON et remplace les données locales. */
export async function importData(): Promise<BackupSummary> {
	const picked = await File.pickFileAsync({ mimeTypes: "application/json" });
	if (picked.canceled) throw new ImportError("Import annulé.");

	return applyBackupData(parseBackupContent(await picked.result.text()));
}

/** Restaure la sauvegarde de secours écrite juste avant le dernier import. */
export async function restoreSafetyBackup(): Promise<BackupSummary> {
	const file = new File(Paths.cache, "before-import-safety-backup.json");
	if (!file.exists) {
		throw new ImportError("Aucune sauvegarde de secours disponible.");
	}

	const data = JSON.parse(await file.text());
	if (!isBackupDataShape(data)) {
		throw new ImportError("La sauvegarde de secours est corrompue.");
	}

	return replaceStores(validateMigratedBackupData(migrateBackupData(data)));
}
