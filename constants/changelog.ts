export type ChangelogEntry = {
	version: string;
	/** Timestamp (ms), formaté à l'affichage avec `formatDate`. */
	date: number;
	items: string[];
};

/**
 * Nouveautés destinées à l'utilisateur (page Réglages ▸ À propos), la plus récente en premier —
 * distinct d'IMPROVEMENTS.md qui est un journal technique pour le développement. À compléter à
 * chaque changement notable côté utilisateur.
 */
export const CHANGELOG: ChangelogEntry[] = [
	{
		version: "1.0.0",
		date: Date.UTC(2026, 7, 10),
		items: [
			"Une seule partie à la fois : l'accueil bloque désormais le lancement d'une nouvelle partie tant que la partie en cours n'est pas terminée ou abandonnée.",
			"La couleur d'avatar choisie à la création d'un joueur ne change plus après validation.",
			"Une flèche dans l'en-tête permet de passer à l'étape suivante pendant la saisie des scores.",
			"Écran de résultats enrichi : répartition des points par joueur et comparaison par catégorie, en graphiques.",
			"Nouvelle page « À propos » : soutenir le projet, nouveautés, informations.",
		],
	},
];
