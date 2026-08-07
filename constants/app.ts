import packageJson from "@/package.json";

export const APP_INFO = {
	name: "7 Wonders: Assistant",
	// Lue depuis package.json plutôt que dupliquée en dur, pour ne plus jamais désynchroniser
	// l'affichage de Réglages de la version réellement publiée.
	version: packageJson.version,
} as const;
