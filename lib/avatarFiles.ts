import {
	deleteFileQuietly,
	fileExists,
	getAppDirectory,
	pruneAppDirectory,
	readFileBase64,
	writeBase64File,
} from "@forthtilliath/react-native-kit/utils/files/appFiles";
import { saveImageThumbnail } from "@forthtilliath/react-native-kit/utils/files/imageThumbnail";
import type { Player } from "@/types/game";

/**
 * Photos des joueurs, gardées dans le dossier persistant de l'app plutôt qu'à l'emplacement renvoyé
 * par le sélecteur d'images (un cache que le système peut vider à tout moment). Elles sont réduites
 * à une petite vignette (256 px, ce que fait `saveImageThumbnail` par défaut ; l'avatar le plus grand
 * de l'app fait 96 dp) : c'est ce qui permet de les embarquer en base64 dans les sauvegardes (export
 * JSON et Google Drive) sans faire exploser leur taille.
 */
const AVATARS = { directory: "avatars", prefix: "avatar" };

/** Photos à embarquer dans une sauvegarde : id du joueur → image JPEG en base64. */
export type AvatarImages = Record<string, string>;

/** Vrai si la photo est déjà rangée dans le dossier persistant des avatars. */
export function isStoredAvatar(uri: string): boolean {
	return uri.startsWith(getAppDirectory(AVATARS.directory).uri);
}

/** Réduit l'image choisie en vignette et la range dans le dossier persistant. Renvoie sa nouvelle URI. */
export function storeAvatar(sourceUri: string): Promise<string> {
	return saveImageThumbnail(sourceUri, AVATARS);
}

/**
 * Comme `storeAvatar`, pour une photo prise avec l'appareil photo : efface ensuite la prise de vue
 * d'origine, en pleine résolution dans le cache de l'app, pour ne garder que la vignette. Les photos
 * de la galerie ne sont pas concernées : on ne touche jamais à un fichier qui n'est pas à l'app.
 */
export async function storeCameraAvatar(sourceUri: string): Promise<string> {
	const uri = await storeAvatar(sourceUri);
	deleteFileQuietly(sourceUri);
	return uri;
}

/** Lit les photos des joueurs pour une sauvegarde. Une photo illisible est simplement omise. */
export function collectAvatars(players: Player[]): AvatarImages {
	const avatars: AvatarImages = {};
	for (const player of players) {
		if (!player.avatarUri) continue;
		// Fichier disparu (ancienne photo restée dans le cache vidé) : le joueur garde ses initiales.
		const base64 = readFileBase64(player.avatarUri);
		if (base64) avatars[player.id] = base64;
	}
	return avatars;
}

/**
 * Recrée sur l'appareil les photos d'une sauvegarde et y fait pointer les joueurs. Un joueur sans
 * photo dans la sauvegarde mais dont l'URI ne mène à aucun fichier ici (sauvegarde faite sur un autre
 * téléphone avant que les photos y soient embarquées) perd son avatar plutôt qu'afficher un rond vide.
 */
export function restoreAvatars(players: Player[], avatars: AvatarImages = {}): Player[] {
	return players.map((player) => {
		const base64 = avatars[player.id];
		if (base64) return { ...player, avatarUri: writeBase64File(base64, AVATARS) };
		if (player.avatarUri && !fileExists(player.avatarUri)) {
			return { ...player, avatarUri: undefined };
		}
		return player;
	});
}

/**
 * Range dans le dossier persistant les photos choisies avant son existence (encore dans le cache du
 * sélecteur). Renvoie la nouvelle URI de chaque joueur concerné, `undefined` si la photo a déjà été
 * effacée par le système.
 */
export async function persistLegacyAvatars(
	players: Player[],
): Promise<{ id: string; avatarUri: string | undefined }[]> {
	const updates: { id: string; avatarUri: string | undefined }[] = [];
	for (const player of players) {
		if (!player.avatarUri || isStoredAvatar(player.avatarUri)) continue;
		if (!fileExists(player.avatarUri)) {
			updates.push({ id: player.id, avatarUri: undefined });
			continue;
		}
		try {
			updates.push({ id: player.id, avatarUri: await storeAvatar(player.avatarUri) });
		} catch {
			// Nouvel essai au prochain démarrage.
		}
	}
	return updates;
}

/**
 * Supprime les photos qui ne sont plus utilisées par aucun joueur (photo remplacée, joueur supprimé,
 * formulaire abandonné après avoir choisi une photo, données remplacées par un import).
 */
export function pruneUnusedAvatars(players: Player[]): void {
	pruneAppDirectory(
		AVATARS.directory,
		players.flatMap((player) => (player.avatarUri ? [player.avatarUri] : [])),
	);
}
