export type ExtensionId = "leaders" | "cities" | "babel" | "armada" | "edifice";

export const ALL_EXTENSIONS: ExtensionId[] = ["leaders", "cities", "babel", "armada", "edifice"];

/** Édition du jeu de base : la 2e (2020) a changé le dos des cartes, certaines extensions ne se
 * jouent donc qu'avec l'une des deux (cf. constants/editions.ts). */
export type GameEdition = "first" | "second";

/** Tuiles Babel posées par un joueur au cours de la partie (3 au maximum). */
export type BabelTileCount = 0 | 1 | 2 | 3;

export type Player = {
	id: string;
	name: string;
	avatarUri?: string;
	isFavorite: boolean;
	isArchived: boolean;
	createdAt: number;
};

/** Groupe de joueurs habituels (ex. "Soirée jeux du jeudi"), pour les sélectionner en un geste
 * plutôt qu'un par un lors de la création d'une partie. */
export type PlayerGroup = {
	id: string;
	name: string;
	playerIds: string[];
	isFavorite: boolean;
	isArchived: boolean;
	createdAt: number;
};

/** Extension non officielle créée par l'utilisateur (ex. Wonders Box, ses propres créations) pour
 * regrouper des merveilles perso. Désactivée, ses merveilles ne sont plus proposées à la saisie. */
export type CustomWonderPack = {
	id: string;
	name: string;
	enabled: boolean;
	createdAt: number;
};

/** Merveille ajoutée par l'utilisateur, rattachée à aucune extension officielle (contenu
 * communautaire, promo absente du catalogue…). Sans `packId`, elle est proposée dans toutes les
 * parties ; sinon, tant que son extension non officielle est activée. */
export type CustomWonder = {
	id: string;
	name: string;
	packId?: string;
	createdAt: number;
};

/** Compteurs de symboles scientifiques bruts saisis par le joueur. */
export type ScienceInput = {
	compass: number;
	tablet: number;
	gear: number;
	/** Symboles "au choix" (guildes des scientifiques, effets de meneurs, etc.). */
	wildcards: number;
	/** Symboles qui dupliquent automatiquement le type déjà le plus fréquent (pas un choix libre). */
	maxSymbols: number;
};

/** Les catégories de score de base, communes à toutes les parties. */
export const BASE_CATEGORIES = [
	"military",
	"treasury",
	"wonders",
	"civilians",
	"commercials",
	"scientifics",
	"guilds",
] as const;

export type BaseCategoryId = (typeof BASE_CATEGORIES)[number];

/**
 * Catégories de score liées à une extension mais distinctes de l'extension elle-même : Armada
 * apporte deux scores séparés, pas un seul comme Leaders/Cities. Le plateau Armada + cartes Îles
 * porte l'id de l'extension ("armada"), les jetons de conflit naval ont leur propre id ("naval").
 */
export const EXTRA_CATEGORIES = ["naval"] as const;
export type ExtraCategoryId = (typeof EXTRA_CATEGORIES)[number];

/** Extensions sans catégorie de score à elles : pions Participation et jetons Dette
 * d'Edifice se comptent avec le trésor. */
export type ExtensionWithoutCategory = "edifice";

export type CategoryId =
	| BaseCategoryId
	| Exclude<ExtensionId, ExtensionWithoutCategory>
	| ExtraCategoryId;

/** Saisie brute d'un joueur pour une partie : ce que l'utilisateur remplit à l'écran. */
export type PlayerGameEntry = {
	playerId: string;
	/** Total des jetons de conflit terrestre (Victoire +1/+3/+5, Défaite -1) déjà additionnés. */
	military: { points: number };
	/**
	 * Total en points déjà calculé (pièces ÷ 3, moins les éventuels jetons de dette de Cities) :
	 * les dettes réduisent les PV sans passer par les pièces restantes, une simple formule sur le
	 * nombre de pièces ne suffit donc pas à retrouver ce total.
	 */
	treasury: { points: number };
	/**
	 * Merveille jouée : nom libre + face A/B. Le catalogue (constants/wonders.ts) et les merveilles
	 * de l'utilisateur ne servent que de suggestions : on stocke le nom plutôt qu'un id, pour garder
	 * lisibles les parties jouées avec une merveille supprimée depuis. Chaîne vide / null = non
	 * renseigné. Pure info, sans impact sur le calcul du score.
	 */
	wonder: { name: string; side: "A" | "B" | null };
	wonders: { points: number };
	civilians: { points: number };
	commercials: { points: number };
	scientifics: ScienceInput;
	guilds: { points: number };
	leaders: { points: number };
	cities: { points: number };
	/** Onglet Babel : nombre de tuiles posées sur la tour, converti en points par un barème fixe
	 * (lib/scoring/babel.ts) plutôt que saisi en points. */
	babel: { tiles: BabelTileCount };
	/** Onglet Maritime : total des jetons de conflit naval (Armada), séparés des jetons militaires
	 * terrestres. */
	naval: { points: number };
	/** Onglet Armada : cartes Îles + bonus du plateau individuel Armada (construction navale), saisis
	 * à part des jetons de conflit naval puisqu'ils ne se déduisent pas d'une formule (dépend des
	 * cartes/du plateau réellement joués). */
	armada: { points: number };
};

export type Game = {
	id: string;
	createdAt: number;
	finishedAt?: number;
	/** Absente des parties enregistrées avant le choix de l'édition. */
	edition?: GameEdition;
	extensions: ExtensionId[];
	playerIds: string[];
	entries: Record<string, PlayerGameEntry>;
};

export function createEmptyPlayerGameEntry(playerId: string): PlayerGameEntry {
	return {
		playerId,
		military: { points: 0 },
		treasury: { points: 0 },
		wonder: { name: "", side: null },
		wonders: { points: 0 },
		civilians: { points: 0 },
		commercials: { points: 0 },
		scientifics: { compass: 0, tablet: 0, gear: 0, wildcards: 0, maxSymbols: 0 },
		guilds: { points: 0 },
		leaders: { points: 0 },
		cities: { points: 0 },
		babel: { tiles: 0 },
		naval: { points: 0 },
		armada: { points: 0 },
	};
}
