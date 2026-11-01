import { getAppDirectory } from "@forthtilliath/react-native-kit/utils/files/appFiles";
import { shareTextFile } from "@forthtilliath/react-native-kit/utils/helpers/shareTextFile";
import { formatFileTimestamp } from "@forthtilliath/ts-kit/files/formatFileTimestamp";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { File } from "expo-file-system";

/**
 * Copies de secours de l'état d'un store, gardées telles qu'enregistrées dans le dossier privé de
 * l'app, avant chaque conversion de format. Le store est ensuite réécrit : si la conversion échoue,
 * ces copies sont tout ce qui reste des données. Elles ne sont donc jamais supprimées par l'app
 * (une par store et par version : quelques fichiers au plus).
 */
const RESCUE_DIRECTORY = "secours";

/** `uri` est null quand la copie n'a pu être gardée que dans AsyncStorage (voir `rescueStorageKey`). */
export type RescueCopy = { uri: string | null; created: boolean };

/** Nom fixe : une copie déjà gardée (même store, même version) n'est jamais écrasée. */
export function rescueFileName(storeName: string, version: number): string {
	return `${storeName}-v${version}-avant-migration.json`;
}

/** Dernier recours, si le fichier ne peut pas être écrit : une clé à part, à côté du store. */
export function rescueStorageKey(storeName: string): string {
	return `${storeName}:secours`;
}

/** Garde une copie de `state` ; `created` est faux si cette copie existait déjà. */
export function keepRescueCopy(storeName: string, version: number, state: unknown): RescueCopy {
	const content = {
		app: "7wonders-assistant",
		store: storeName,
		version,
		savedAt: Date.now(),
		state,
	};
	try {
		const file = new File(getAppDirectory(RESCUE_DIRECTORY), rescueFileName(storeName, version));
		if (file.exists) return { uri: file.uri, created: false };
		file.create();
		file.write(JSON.stringify(content));
		return { uri: file.uri, created: true };
	} catch {
		void keepInStorage(rescueStorageKey(storeName), content);
		return { uri: null, created: true };
	}
}

async function keepInStorage(key: string, content: unknown): Promise<void> {
	try {
		if ((await AsyncStorage.getItem(key)) === null) {
			await AsyncStorage.setItem(key, JSON.stringify(content));
		}
	} catch {
		// Stockage inaccessible : il n'y a rien de plus à sauver.
	}
}

/**
 * Partage les copies de secours réunies en un seul fichier JSON, pour les garder hors du
 * téléphone. Une copie illisible est simplement omise.
 * @throws une `Error` au message affichable si le partage n'est pas disponible.
 */
export async function exportRescueCopies(uris: string[]): Promise<void> {
	const copies = uris.flatMap((uri) => {
		try {
			return [JSON.parse(new File(uri).textSync())];
		} catch {
			return [];
		}
	});
	const content = {
		app: "7wonders-assistant",
		kind: "copies-de-secours",
		exportedAt: Date.now(),
		copies,
	};
	await shareTextFile(`7wonders-secours-${formatFileTimestamp()}.json`, JSON.stringify(content), {
		mimeType: "application/json",
		dialogTitle: "Exporter la copie de secours",
	});
}
