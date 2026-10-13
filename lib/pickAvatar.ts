import * as ImagePicker from "expo-image-picker";
import { Alert, Linking } from "react-native";
import { storeAvatar, storeCameraAvatar } from "@/lib/avatarFiles";

/** D'où vient la photo d'un joueur : prise sur le moment, ou choisie parmi celles du téléphone. */
export type AvatarSource = "camera" | "library";

type SourceConfig = {
	requestPermission: () => Promise<ImagePicker.PermissionResponse>;
	launch: (options: ImagePicker.ImagePickerOptions) => Promise<ImagePicker.ImagePickerResult>;
	store: (uri: string) => Promise<string>;
	deniedTitle: string;
	/** Fin de phrase « Autorise l'accès à … pour … ». */
	access: string;
	purpose: string;
};

const SOURCES: Record<AvatarSource, SourceConfig> = {
	camera: {
		requestPermission: () => ImagePicker.requestCameraPermissionsAsync(),
		launch: (options) => ImagePicker.launchCameraAsync(options),
		store: storeCameraAvatar,
		deniedTitle: "Accès à l'appareil photo refusé",
		access: "l'appareil photo",
		purpose: "prendre le joueur en photo",
	},
	library: {
		requestPermission: () => ImagePicker.requestMediaLibraryPermissionsAsync(),
		launch: (options) => ImagePicker.launchImageLibraryAsync(options),
		store: storeAvatar,
		deniedTitle: "Accès aux photos refusé",
		access: "aux photos",
		purpose: "choisir un avatar",
	},
};

function alertDenied(config: SourceConfig, canAskAgain: boolean): void {
	if (canAskAgain) {
		Alert.alert(config.deniedTitle, `Autorise l'accès ${config.access} pour ${config.purpose}.`);
		return;
	}
	Alert.alert(
		config.deniedTitle,
		`L'accès ${config.access} a été refusé. Autorise-le dans les réglages du téléphone pour ${config.purpose}.`,
		[
			{ text: "Annuler", style: "cancel" },
			{ text: "Ouvrir les réglages", onPress: () => Linking.openSettings() },
		],
	);
}

/**
 * Demande la permission, ouvre l'appareil photo ou la galerie (recadrage carré), puis range la
 * photo en vignette dans l'app. Renvoie sa nouvelle URI, `undefined` si l'utilisateur a renoncé
 * ou si la photo n'a pas pu être enregistrée (il en est alors prévenu).
 */
export async function pickAvatar(source: AvatarSource): Promise<string | undefined> {
	const config = SOURCES[source];
	const permission = await config.requestPermission();
	if (!permission.granted) {
		alertDenied(config, permission.canAskAgain);
		return undefined;
	}

	const result = await config.launch({
		mediaTypes: ["images"],
		allowsEditing: true,
		aspect: [1, 1],
		quality: 0.7,
	});
	if (result.canceled || !result.assets[0]) return undefined;
	try {
		return await config.store(result.assets[0].uri);
	} catch {
		Alert.alert("Photo non enregistrée", "Impossible d'enregistrer cette photo. Réessaie.");
		return undefined;
	}
}
