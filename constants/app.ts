import packageJson from "@/package.json";

export const APP_INFO = {
	name: "7 Wonders: Assistant",
	// Lue depuis package.json plutôt que dupliquée en dur, pour ne plus jamais désynchroniser
	// l'affichage de Réglages de la version réellement publiée.
	version: packageJson.version,
} as const;

/** Dépôt GitHub dont les releases publient l'APK : source unique des mises à jour de l'app. */
export const RELEASES_REPO = { owner: "Forthtilliath", repo: "7wonders-assistant" } as const;

/** Nom du fichier local de l'APK téléchargé, écrasé à chaque mise à jour. */
export const UPDATE_APK_FILE_NAME = "7wonders-update.apk";
