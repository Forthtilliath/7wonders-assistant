/**
 * Accès minimal à l'API REST Google Drive v3, limité au dossier caché propre à l'app
 * (`appDataFolder`, scope `drive.appdata`) : l'app ne voit ni ne touche aucun autre fichier du
 * Drive, et ce dossier n'encombre pas le Drive de l'utilisateur (visible seulement dans
 * Drive ▸ Paramètres ▸ Gérer les applications). Un seul fichier de sauvegarde, écrasé à chaque
 * envoi : la sauvegarde est un instantané complet, inutile d'en garder un historique.
 */

export const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.appdata";
export const DRIVE_BACKUP_FILE_NAME = "7wonders-backup.json";

const FILES_URL = "https://www.googleapis.com/drive/v3/files";
const UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files";

export class DriveError extends Error {
	constructor(
		message: string,
		readonly status: number,
		/** Raison détaillée donnée par Google (ex. "accessNotConfigured"), null si absente. */
		readonly reason: string | null = null,
	) {
		super(message);
	}
}

export type DriveFile = { id: string; modifiedTime: string };

/** Lit la raison d'un refus dans le corps d'erreur standard des API Google, sans jamais échouer. */
async function readErrorReason(response: Response): Promise<string | null> {
	try {
		const data = (await response.json()) as { error?: { errors?: { reason?: string }[] } };
		return data.error?.errors?.[0]?.reason ?? null;
	} catch {
		return null;
	}
}

async function driveFetch(url: string, token: string, init: RequestInit = {}): Promise<Response> {
	const response = await fetch(url, {
		...init,
		headers: { ...init.headers, Authorization: `Bearer ${token}` },
	});
	if (!response.ok) {
		const reason = await readErrorReason(response);
		throw new DriveError(
			`Google Drive a répondu ${response.status}${reason ? ` (${reason})` : ""}.`,
			response.status,
			reason,
		);
	}
	return response;
}

/** Cherche le fichier de sauvegarde dans le dossier de l'app, null s'il n'existe pas encore. */
export async function findBackupFile(token: string): Promise<DriveFile | null> {
	const params = new URLSearchParams({
		spaces: "appDataFolder",
		q: `name = '${DRIVE_BACKUP_FILE_NAME}' and trashed = false`,
		fields: "files(id, modifiedTime)",
		orderBy: "modifiedTime desc",
		pageSize: "1",
	});
	const response = await driveFetch(`${FILES_URL}?${params}`, token);
	const data = (await response.json()) as { files?: DriveFile[] };
	return data.files?.[0] ?? null;
}

export async function downloadBackupFile(token: string, fileId: string): Promise<string> {
	const response = await driveFetch(`${FILES_URL}/${fileId}?alt=media`, token);
	return response.text();
}

/**
 * Écrit le contenu dans le fichier de sauvegarde : mise à jour du fichier existant si `fileId` est
 * fourni, sinon création dans le dossier de l'app (upload "multipart" : métadonnées + contenu en
 * une seule requête).
 */
export async function uploadBackupFile(
	token: string,
	content: string,
	fileId: string | null,
): Promise<DriveFile> {
	const fields = "fields=id,modifiedTime";

	if (fileId) {
		const response = await driveFetch(`${UPLOAD_URL}/${fileId}?uploadType=media&${fields}`, token, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: content,
		});
		return (await response.json()) as DriveFile;
	}

	const boundary = `7wonders-${Date.now()}`;
	const metadata = { name: DRIVE_BACKUP_FILE_NAME, parents: ["appDataFolder"] };
	const body = [
		`--${boundary}`,
		"Content-Type: application/json; charset=UTF-8",
		"",
		JSON.stringify(metadata),
		`--${boundary}`,
		"Content-Type: application/json",
		"",
		content,
		`--${boundary}--`,
	].join("\r\n");

	const response = await driveFetch(`${UPLOAD_URL}?uploadType=multipart&${fields}`, token, {
		method: "POST",
		headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
		body,
	});
	return (await response.json()) as DriveFile;
}
