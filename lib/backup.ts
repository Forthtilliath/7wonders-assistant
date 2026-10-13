import { createBackupManager } from "@forthtilliath/expo-backup";
import { shareTextFile } from "@forthtilliath/react-native-kit/utils/helpers/shareTextFile";
import { formatFileTimestamp } from "@forthtilliath/ts-kit/files/formatFileTimestamp";
import { collectAvatars, restoreAvatars } from "@/lib/avatarFiles";
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
import type { Game } from "@/types/game";

export { ImportError };

export function currentBackupData(): BackupData {
	const players = usePlayersStore.getState().players;
	return {
		app: APP_ID,
		dataVersion: DATA_VERSION,
		exportedAt: Date.now(),
		players,
		history: useHistoryStore.getState().games,
		groups: useGroupsStore.getState().groups,
		avatars: collectAvatars(players),
	};
}

/** Résumé d'une sauvegarde pour les confirmations (restauration, choix au branchement de Drive). */
export function describeBackup(data: BackupData): string {
	return `${data.players.length} joueur(s), ${data.groups.length} groupe(s), ${data.history.length} partie(s)`;
}

/**
 * Valide le contenu texte d'une sauvegarde (fichier importé ou copie Google Drive, déjà déchiffré)
 * et le migre vers la version courante du format. Lève une `ImportError` au message affichable sinon.
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

/** Remplace toutes les données locales (joueurs avec leurs photos, historique, groupes). */
export function replaceAllData(data: BackupData): void {
	usePlayersStore.getState().replaceAll(restoreAvatars(data.players, data.avatars));
	useHistoryStore.getState().replaceAll(data.history);
	useGroupsStore.getState().replaceAll(data.groups);
}

/**
 * Sauvegardes de l'app (`@forthtilliath/expo-backup`) : envoi automatique sur Google Drive après
 * chaque changement, export/import d'un fichier avec annulation de la dernière restauration, et
 * chiffrement au choix de l'utilisateur. `appId` donne le nom des fichiers (`7wonders-backup.json`
 * sur Drive, celui qu'utilisait l'app avant ce paquet) : ne jamais le changer.
 */
export const backup = createBackupManager<BackupData>({
	appId: "7wonders",
	encryption: "optional",
	collect: currentBackupData,
	parse: parseBackupContent,
	apply: replaceAllData,
	isEmpty: (data) => data.players.length === 0 && data.history.length === 0,
	exportFileName: (date) => `7wonders-save-${formatFileTimestamp(date)}.json`,
	exportDialogTitle: "Exporter les données 7 Wonders",
});

/**
 * Exporte l'historique des parties en CSV (une ligne par joueur par partie), pour l'ouvrir dans un
 * tableur. Ne contient pas les joueurs/groupes eux-mêmes : c'est un export de lecture, pas une
 * sauvegarde (voir `backup.exportToFile` pour ça).
 */
export async function exportGamesCsv(): Promise<void> {
	const csv = buildGamesCsv(useHistoryStore.getState().games, usePlayersStore.getState().players);
	await shareTextFile(`7wonders-scores-${formatFileTimestamp()}.csv`, csv, {
		mimeType: "text/csv",
		dialogTitle: "Exporter les scores en CSV",
	});
}

/** Même export CSV, limité à une seule partie (partage du résultat d'une soirée). */
export async function exportGameCsv(game: Game): Promise<void> {
	const csv = buildGamesCsv([game], usePlayersStore.getState().players);
	await shareTextFile(`7wonders-partie-${formatFileTimestamp(new Date(game.createdAt))}.csv`, csv, {
		mimeType: "text/csv",
		dialogTitle: "Partager la partie en CSV",
	});
}
