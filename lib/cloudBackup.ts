import {
	applyBackupData,
	type BackupSummary,
	currentBackupData,
	parseBackupContent,
	serializeBackup,
} from "@/lib/backup";
import type { BackupData } from "@/lib/backupSchema";
import { ImportError } from "@/lib/backupSchema";
import {
	GoogleAuthError,
	getDriveAccessToken,
	invalidateDriveAccessToken,
	signInToGoogle,
	signOutFromGoogle,
} from "@/lib/googleAuth";
import {
	DriveError,
	downloadBackupFile,
	findBackupFile,
	uploadBackupFile,
} from "@/lib/googleDrive";
import { useBackupStore } from "@/stores/backupStore";

/** Exécute un appel Drive, en réessayant une fois avec un jeton neuf si Drive le rejette (401). */
async function withDriveToken<T>(call: (token: string) => Promise<T>): Promise<T> {
	const token = await getDriveAccessToken();
	try {
		return await call(token);
	} catch (error) {
		if (!(error instanceof DriveError) || error.status !== 401) throw error;
		await invalidateDriveAccessToken(token);
		return call(await getDriveAccessToken());
	}
}

/** Message affichable pour n'importe quelle erreur de sauvegarde cloud. */
export function cloudErrorMessage(error: unknown): string {
	if (error instanceof GoogleAuthError || error instanceof ImportError) return error.message;
	if (error instanceof DriveError) {
		// Erreurs de configuration du projet Google Cloud ou de consentement : un message précis
		// évite de chercher la cause à l'aveugle derrière un simple "accès refusé".
		if (error.reason === "accessNotConfigured") {
			return "L'API Google Drive n'est pas activée dans le projet Google Cloud de l'app.";
		}
		if (error.reason === "insufficientPermissions") {
			return "L'accès à Google Drive n'a pas été autorisé. Reconnecte ton compte en acceptant l'accès à Drive.";
		}
		return error.status === 401 || error.status === 403
			? "Google Drive a refusé l'accès. Reconnecte ton compte Google."
			: "Google Drive est momentanément indisponible.";
	}
	// fetch() rejette avec une TypeError quand il n'y a pas de réseau.
	if (error instanceof TypeError) return "Pas de connexion internet.";
	return "La sauvegarde sur Google Drive a échoué.";
}

/** Télécharge et valide la sauvegarde présente sur Drive, null s'il n'y en a pas encore. */
export async function fetchCloudBackup(): Promise<BackupData | null> {
	return withDriveToken(async (token) => {
		const file = await findBackupFile(token);
		if (!file) return null;
		return parseBackupContent(await downloadBackupFile(token, file.id));
	});
}

async function uploadCloudBackup(): Promise<void> {
	const data = currentBackupData();
	await withDriveToken(async (token) => {
		const existing = await findBackupFile(token);
		await uploadBackupFile(token, serializeBackup(data), existing?.id ?? null);
	});
	useBackupStore.getState().markCloudBackedUp(data.exportedAt);
}

let syncing = false;
let syncAgain = false;

/**
 * Envoie l'état actuel sur Drive si un compte est relié. Un seul envoi à la fois : un changement
 * survenu pendant l'envoi en déclenche un nouveau à la fin, pour ne jamais laisser sur Drive un
 * instantané plus ancien que les données locales. Les erreurs ne sont jamais levées : elles sont
 * mémorisées dans le store (affichées dans Réglages ▸ Sauvegardes) et l'envoi reste "en attente"
 * pour être retenté au prochain retour dans l'app.
 */
export async function syncCloudBackupNow(): Promise<boolean> {
	if (!useBackupStore.getState().cloudAccount) return false;
	if (syncing) {
		syncAgain = true;
		return false;
	}

	syncing = true;
	try {
		await uploadCloudBackup();
		return true;
	} catch (error) {
		useBackupStore.getState().setCloudError(cloudErrorMessage(error));
		return false;
	} finally {
		syncing = false;
		if (syncAgain) {
			syncAgain = false;
			useBackupStore.getState().markCloudPending();
			void syncCloudBackupNow();
		}
	}
}

export type ConnectResult =
	| { status: "cancelled" }
	| { status: "connected"; email: string }
	/** Une sauvegarde non vide existe déjà sur Drive : à l'utilisateur de choisir laquelle garder. */
	| { status: "conflict"; email: string; remote: BackupData };

/**
 * Relie un compte Google. Si une sauvegarde existe déjà sur Drive (nouveau téléphone,
 * réinstallation…), rien n'est envoyé avant que l'utilisateur ait choisi : un envoi automatique
 * écraserait la sauvegarde distante avec les données (peut-être vides) de cet appareil.
 */
export async function connectGoogleDrive(): Promise<ConnectResult> {
	const email = await signInToGoogle();
	if (!email) return { status: "cancelled" };

	let remote: BackupData | null;
	try {
		remote = await fetchCloudBackup();
	} catch (error) {
		await signOutFromGoogle();
		throw error;
	}

	if (remote && (remote.players.length > 0 || remote.history.length > 0)) {
		return { status: "conflict", email, remote };
	}

	useBackupStore.getState().connectCloud(email);
	await syncCloudBackupNow();
	return { status: "connected", email };
}

/** Choix "Restaurer la sauvegarde Drive" après un conflit à la connexion. */
export async function connectWithRemoteBackup(
	email: string,
	remote: BackupData,
): Promise<BackupSummary> {
	// Restauration avant de relier le compte : sinon le remplacement des données déclencherait un
	// envoi automatique inutile (les données locales sont alors identiques à celles de Drive).
	const summary = await applyBackupData(remote);
	useBackupStore.getState().connectCloud(email);
	useBackupStore.getState().markCloudBackedUp(remote.exportedAt);
	return summary;
}

/** Choix "Garder les données de ce téléphone" après un conflit : elles remplacent celles de Drive. */
export async function connectWithLocalData(email: string): Promise<void> {
	useBackupStore.getState().connectCloud(email);
	await syncCloudBackupNow();
}

/** Restaure à la demande la sauvegarde Drive du compte déjà relié. */
export async function restoreFromCloud(remote: BackupData): Promise<BackupSummary> {
	const summary = await applyBackupData(remote);
	useBackupStore.getState().markCloudBackedUp(remote.exportedAt);
	return summary;
}

/** Délie le compte : la sauvegarde reste sur Drive, l'app n'y accède simplement plus. */
export async function disconnectGoogleDrive(): Promise<void> {
	await signOutFromGoogle();
	useBackupStore.getState().disconnectCloud();
}
