export type ExtensionId = "leaders" | "cities" | "armada";

export const ALL_EXTENSIONS: ExtensionId[] = ["leaders", "cities", "armada"];

export type Player = {
	id: string;
	name: string;
	avatarUri?: string;
	isFavorite: boolean;
	isArchived: boolean;
	createdAt: number;
};

/** Compteurs de symboles scientifiques bruts saisis par le joueur. */
export type ScienceInput = {
	compass: number;
	tablet: number;
	gear: number;
	/** Symboles "au choix" (guildes des scientifiques, effets de meneurs, etc.). */
	wildcards: number;
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
export type CategoryId = BaseCategoryId | ExtensionId;

/** Saisie brute d'un joueur pour une partie : ce que l'utilisateur remplit à l'écran. */
export type PlayerGameEntry = {
	playerId: string;
	/** Total des jetons de conflit terrestre (Victoire +1/+3/+5, Défaite -1) déjà additionnés. */
	military: { points: number };
	/**
	 * Total en points déjà calculé (pièces ÷ 3, moins les éventuels jetons de dette de Cités) :
	 * les dettes réduisent les PV sans passer par les pièces restantes, une simple formule sur le
	 * nombre de pièces ne suffit donc pas à retrouver ce total.
	 */
	treasury: { points: number };
	wonders: { points: number };
	civilians: { points: number };
	commercials: { points: number };
	scientifics: ScienceInput;
	guilds: { points: number };
	leaders: { points: number };
	cities: { points: number };
	/** Total des jetons de conflit naval (Armada), séparés des jetons militaires terrestres. */
	armada: { points: number };
};

export type Game = {
	id: string;
	createdAt: number;
	finishedAt?: number;
	extensions: ExtensionId[];
	playerIds: string[];
	entries: Record<string, PlayerGameEntry>;
};

export function createEmptyPlayerGameEntry(playerId: string): PlayerGameEntry {
	return {
		playerId,
		military: { points: 0 },
		treasury: { points: 0 },
		wonders: { points: 0 },
		civilians: { points: 0 },
		commercials: { points: 0 },
		scientifics: { compass: 0, tablet: 0, gear: 0, wildcards: 0 },
		guilds: { points: 0 },
		leaders: { points: 0 },
		cities: { points: 0 },
		armada: { points: 0 },
	};
}
