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

/** Résultat d'un joueur pour un âge de conflit militaire. */
export type AgeResult = "win" | "tie" | "loss";

export type MilitaryInput = {
	age1: AgeResult;
	age2: AgeResult;
	age3: AgeResult;
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
	military: MilitaryInput;
	treasury: { coins: number };
	wonders: { points: number };
	civilians: { points: number };
	commercials: { points: number };
	scientifics: ScienceInput;
	guilds: { points: number };
	leaders: { points: number };
	cities: { points: number };
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
		military: { age1: "tie", age2: "tie", age3: "tie" },
		treasury: { coins: 0 },
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
