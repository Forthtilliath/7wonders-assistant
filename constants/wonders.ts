import { EXTENSION_LABELS } from "@/constants/categories";
import type { ExtensionId, GameEdition } from "@/types/game";

/**
 * Origine d'une merveille officielle : le jeu de base, une extension de l'app qui apporte des
 * plateaux (Babel et Edifice n'en ajoutent aucun), ou le Wonder Pack, recueil de merveilles promo
 * sans étape de score à lui (donc pas une extension à cocher). Les extensions non officielles sont
 * créées par l'utilisateur (types/game.ts, `CustomWonderPack`).
 */
export type OfficialWonderSource =
	| "base"
	| Extract<ExtensionId, "leaders" | "cities" | "armada">
	| "wonderPack";

/** Toute origine possible d'une merveille proposée : officielle ou ajoutée par l'utilisateur. */
export type WonderSource = OfficialWonderSource | "custom";

export type OfficialWonder = {
	/** Identifiant stable (anglais), indépendant du nom affiché. */
	id: string;
	name: string;
	source: OfficialWonderSource;
	/** Éditions du jeu de base avec lesquelles ce plateau existe. */
	editions: readonly GameEdition[];
	/** Anciens noms donnés par l'app, encore présents dans l'historique, la partie en cours ou une
	 * sauvegarde : ils sont convertis vers `name` (lib/wonders.ts, `toCanonicalWonderName`). */
	formerNames?: readonly string[];
};

const BOTH_EDITIONS: readonly GameEdition[] = ["first", "second"];
const FIRST_EDITION_ONLY: readonly GameEdition[] = ["first"];

/** Ordre d'affichage des sources, du jeu de base aux merveilles de l'utilisateur. */
export const WONDER_SOURCE_ORDER: WonderSource[] = [
	"base",
	"leaders",
	"cities",
	"armada",
	"wonderPack",
	"custom",
];

export const WONDER_SOURCE_LABELS: Record<WonderSource, string> = {
	base: "Jeu de base",
	leaders: EXTENSION_LABELS.leaders,
	cities: EXTENSION_LABELS.cities,
	armada: EXTENSION_LABELS.armada,
	wonderPack: "Wonder Pack",
	custom: "Mes merveilles",
};

const base = (id: string, name: string, formerName: string): OfficialWonder => ({
	id,
	name,
	source: "base",
	editions: BOTH_EDITIONS,
	formerNames: [formerName],
});

/**
 * Plateaux merveille officiels, sous le nom court de leur cité (celui qu'on annonce à table). Ceux du
 * jeu de base portent le nom imprimé sur le plateau, en VO, plutôt qu'une traduction. Les plateaux du
 * jeu de base, de Leaders, Cities et Armada existent dans les deux éditions ; le Wonder Pack n'a été
 * édité que pour la 1re.
 */
export const OFFICIAL_WONDERS: readonly OfficialWonder[] = [
	base("alexandria", "Alexandria", "Alexandrie"),
	base("babylon", "Babylon", "Babylone"),
	base("ephesus", "Ephesos", "Éphèse"),
	base("giza", "Gizah", "Gizeh"),
	base("halicarnassus", "Halikarnassos", "Halicarnasse"),
	base("olympia", "Olympía", "Olympie"),
	base("rhodes", "Rhódos", "Rhodes"),
	{ id: "roma", name: "Rome", source: "leaders", editions: BOTH_EDITIONS },
	{ id: "byzantium", name: "Byzance", source: "cities", editions: BOTH_EDITIONS },
	{ id: "petra", name: "Pétra", source: "cities", editions: BOTH_EDITIONS },
	{ id: "siracusa", name: "Syracuse", source: "armada", editions: BOTH_EDITIONS },
	{ id: "abu-simbel", name: "Abou Simbel", source: "wonderPack", editions: FIRST_EDITION_ONLY },
	{ id: "great-wall", name: "Grande Muraille", source: "wonderPack", editions: FIRST_EDITION_ONLY },
	{ id: "manneken-pis", name: "Manneken Pis", source: "wonderPack", editions: FIRST_EDITION_ONLY },
	{ id: "stonehenge", name: "Stonehenge", source: "wonderPack", editions: FIRST_EDITION_ONLY },
];

/** Longueur maximale d'un nom de merveille, la même que celle acceptée à l'import d'une sauvegarde. */
export const MAX_WONDER_NAME_LENGTH = 100;

/** Longueur maximale du nom d'une extension non officielle. */
export const MAX_WONDER_PACK_NAME_LENGTH = 100;

/** Nombre maximal de merveilles perso et d'extensions non officielles, les mêmes qu'à l'import d'une
 * sauvegarde : au-delà, la sauvegarde exportée ne pourrait plus être réimportée. */
export const MAX_CUSTOM_WONDERS = 1000;
export const MAX_WONDER_PACKS = 100;
