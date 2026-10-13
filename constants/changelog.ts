export type ChangelogEntry = {
	version: string;
	/** Timestamp (ms), formaté à l'affichage avec `formatDate`. */
	date: number;
	items: string[];
};

/**
 * Nouveautés destinées à l'utilisateur (page Réglages ▸ Nouveautés), la plus récente en premier —
 * distinct d'IMPROVEMENTS.md qui est un journal technique pour le développement. À compléter à
 * chaque changement notable côté utilisateur.
 */
export const CHANGELOG: ChangelogEntry[] = [
	{
		version: "1.2.0",
		date: Date.UTC(2026, 9, 13),
		items: [
			"Extension Babel : une étape de score après Leaders et Cités, où l'on coche le nombre de tuiles posées par chaque joueur (1 tuile = 2 pts, 2 = 5 pts, 3 = 10 pts).",
			"Extension Edifice : sans étape de score à part, ses pions Participation et ses jetons Dette se comptent avec le trésor. Un avertissement s'affiche si elle est cochée avec Babel, qu'elle remplace.",
			"Choix de l'édition du jeu (1re ou 2e) à côté des extensions, au lancement d'une partie comme dans les réglages : seules les extensions compatibles sont proposées (Babel n'existe qu'en 1re édition).",
			"Parties à 8 joueurs avec l'extension Cités : les groupes peuvent compter jusqu'à 8 membres, et Cités ne peut plus être retirée d'une partie à 8.",
			"Photo d'un joueur prise directement avec l'appareil photo, pratique pour distinguer deux joueurs du même nom. La photo peut aussi être retirée.",
			"Les points saisis par catégorie sont limités à des valeurs réalistes, pour éviter les fautes de frappe.",
			"Réglages réorganisés : Nouveautés, Dons et À propos ont chacun leur page.",
			"Les nouvelles versions sont annoncées par un bandeau sur l'onglet Jouer : installation en un geste, ou « Ignorer » pour ne plus voir cette version.",
			"Tes données ne sont plus copiées dans la sauvegarde automatique d'Android : utilise la sauvegarde de l'app (export ou Google Drive) pour changer de téléphone.",
		],
	},
	{
		version: "1.1.0",
		date: Date.UTC(2026, 9, 13),
		items: [
			"Sauvegarde automatique sur Google Drive (facultative) : tes données sont envoyées après chaque modification dans un dossier privé de l'app, et restaurables sur un nouveau téléphone.",
			"Mise à jour depuis l'app : Réglages ▸ À propos télécharge la nouvelle version et lance son installation, sans passer par le navigateur.",
			"Sauvegardes : chiffrement optionnel des fichiers exportés et de la copie Google Drive, et possibilité d'annuler la dernière restauration.",
			"Les photos des joueurs sont désormais conservées durablement et incluses dans les sauvegardes (export et Google Drive) : elles sont restaurées sur un nouveau téléphone.",
			"Partage d'une partie depuis les résultats ou l'historique : classement en texte, en image ou en CSV.",
			"Un rappel discret sur l'onglet Jouer quand des parties n'ont pas été sauvegardées depuis un moment.",
			"Nouveau thème bronze et or, avec des titres plus lisibles et des textes toujours contrastés sur les fonds colorés.",
		],
	},
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
