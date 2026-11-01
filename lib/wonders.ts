import { MAX_WONDER_NAME_LENGTH, OFFICIAL_WONDERS, type WonderSource } from "@/constants/wonders";
import type { CustomWonder, ExtensionId, Game, GameEdition, PlayerGameEntry } from "@/types/game";

/** Merveille proposée à la saisie, avec son origine. */
export type WonderOption = {
	name: string;
	source: WonderSource;
};

/** Clé de comparaison d'un nom : sans espaces autour, sans casse ni accents ("rhod" trouve Rhódos). */
export function normalizeWonderName(name: string): string {
	return name.trim().normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Nom officiel de chaque plateau, par clé de son nom actuel et de ses anciens noms. */
const OFFICIAL_NAME_BY_KEY = new Map(
	OFFICIAL_WONDERS.flatMap((wonder) =>
		[wonder.name, ...(wonder.formerNames ?? [])].map(
			(name) => [normalizeWonderName(name), wonder.name] as const,
		),
	),
);

/**
 * Écriture de référence d'un nom saisi : celle du catalogue officiel (y compris pour un ancien nom,
 * "Alexandrie" → "Alexandria") ou des merveilles perso quand le nom n'en diffère que par la casse,
 * les accents ou les espaces autour ("rhodos" → "Rhódos"). Un nom inconnu est rendu tel quel. Évite
 * qu'une même merveille soit comptée sous deux noms dans les statistiques.
 */
export function toCanonicalWonderName(
	name: string,
	customWonders: readonly Pick<CustomWonder, "name">[] = [],
): string {
	const key = normalizeWonderName(name);
	if (!key) return name;
	const official = OFFICIAL_NAME_BY_KEY.get(key);
	if (official) return official;
	return customWonders.find((w) => normalizeWonderName(w.name) === key)?.name ?? name;
}

/** `toCanonicalWonderName` appliqué à la merveille de chaque saisie d'une partie. */
export function canonicalizeWonderNames<E extends Pick<PlayerGameEntry, "wonder">>(
	entries: Record<string, E>,
	customWonders: readonly Pick<CustomWonder, "name">[] = [],
): Record<string, E> {
	return Object.fromEntries(
		Object.entries(entries).map(([id, entry]) => {
			// Données pas encore validées (migration) : une saisie mal formée est laissée telle quelle.
			const name = entry?.wonder?.name;
			if (typeof name !== "string") return [id, entry];
			return [
				id,
				{ ...entry, wonder: { ...entry.wonder, name: toCanonicalWonderName(name, customWonders) } },
			];
		}),
	);
}

/**
 * Renomme une merveille dans des parties : chaque saisie dont le nom correspond à `from` (sans casse
 * ni accents) prend `to`. Les parties sans changement gardent leur référence.
 */
export function renameWonderInGames(games: readonly Game[], from: string, to: string): Game[] {
	const key = normalizeWonderName(from);
	return games.map((game) => {
		const touched = Object.values(game.entries).some(
			(entry) => normalizeWonderName(entry.wonder.name) === key,
		);
		if (!touched) return game;
		return { ...game, entries: renameWonderInEntries(game.entries, from, to) };
	});
}

/** Comme `renameWonderInGames`, pour les saisies d'une seule partie (la partie en cours). */
export function renameWonderInEntries(
	entries: Record<string, PlayerGameEntry>,
	from: string,
	to: string,
): Record<string, PlayerGameEntry> {
	const key = normalizeWonderName(from);
	return Object.fromEntries(
		Object.entries(entries).map(([id, entry]) => [
			id,
			normalizeWonderName(entry.wonder.name) === key
				? { ...entry, wonder: { ...entry.wonder, name: to } }
				: entry,
		]),
	);
}

/**
 * Merveilles jouables dans une partie : les plateaux officiels de l'édition choisie (jeu de base,
 * extensions actives, Wonder Pack) puis celles de l'utilisateur sans extension ou d'une extension
 * non officielle cochée pour la partie, par ordre alphabétique. Une merveille perso homonyme d'une
 * officielle n'est pas répétée.
 */
export function getAvailableWonders(
	edition: GameEdition,
	extensions: readonly ExtensionId[],
	customWonders: readonly CustomWonder[],
	/** Extensions non officielles cochées pour la partie. */
	wonderPackIds: readonly string[],
): WonderOption[] {
	const official: WonderOption[] = OFFICIAL_WONDERS.filter(
		(wonder) =>
			wonder.editions.includes(edition) &&
			(wonder.source === "base" ||
				wonder.source === "wonderPack" ||
				extensions.includes(wonder.source)),
	).map(({ name, source }) => ({ name, source }));

	const officialKeys = new Set(official.map((w) => normalizeWonderName(w.name)));
	const custom: WonderOption[] = customWonders
		.filter((w) => !w.packId || wonderPackIds.includes(w.packId))
		.filter((w) => !officialKeys.has(normalizeWonderName(w.name)))
		.map((w) => ({ name: w.name, source: "custom" as const }))
		.sort((a, b) => a.name.localeCompare(b.name));

	return [...official, ...custom];
}

type SuggestionsInput = {
	options: readonly WonderOption[];
	/** Historique : ses noms déjà saisis complètent les suggestions dès qu'on tape. */
	games: readonly Game[];
	query: string;
	/** Merveilles déjà choisies par les autres joueurs de la partie : un plateau ne se joue qu'une fois. */
	takenNames?: readonly string[];
	/** Merveilles connues (catalogue officiel + merveilles perso) : celles de l'historique qui ne sont
	 * pas jouables dans la partie (autre édition, extension non cochée) ne sont pas suggérées. */
	knownNames?: readonly string[];
	limit?: number;
};

/**
 * Suggestions de noms pour le champ Merveille, pour éviter les doublons dus à des fautes de frappe
 * dans les statistiques par merveille. Rien tant que le champ est vide ; ensuite, les noms qui
 * contiennent la recherche (sans casse ni accents), ceux qui commencent par elle d'abord, puis
 * merveilles jouables avant noms de l'historique (hors merveilles connues non jouables dans la
 * partie), sans répéter le nom déjà tapé.
 */
export function getWonderNameSuggestions({
	options,
	games,
	query,
	takenNames = [],
	knownNames = [],
	limit = 5,
}: SuggestionsInput): string[] {
	const excluded = new Set(takenNames.map(normalizeWonderName));
	const normalizedQuery = normalizeWonderName(query);
	if (!normalizedQuery) return [];

	// Dédoublonne en ignorant casse et accents, en gardant la première écriture rencontrée.
	const namesByKey = new Map<string, string>();
	const add = (name: string) => {
		const key = normalizeWonderName(name);
		if (key && !namesByKey.has(key)) namesByKey.set(key, name.trim());
	};
	for (const option of options) add(option.name);
	const playableKeys = new Set(namesByKey.keys());
	const unplayable = new Set(
		knownNames.map(normalizeWonderName).filter((key) => !playableKeys.has(key)),
	);

	const historyNames = games
		.flatMap((game) => Object.values(game.entries).map((entry) => entry.wonder.name))
		.filter((name) => name.trim() && !unplayable.has(normalizeWonderName(name)))
		.sort((a, b) => a.localeCompare(b));
	for (const name of historyNames) add(name);

	return (
		Array.from(namesByKey.entries())
			// Le nom n'est caché que s'il est déjà tapé à l'identique : "rhodos" propose encore Rhódos,
			// sinon le nom sans accent serait enregistré tel quel.
			.filter(
				([key, name]) =>
					key.includes(normalizedQuery) && name !== query.trim() && !excluded.has(key),
			)
			// Tri stable : l'ordre jouables puis historique est gardé à l'intérieur de chaque groupe.
			.sort(
				([a], [b]) =>
					Number(!a.startsWith(normalizedQuery)) - Number(!b.startsWith(normalizedQuery)),
			)
			.map(([, name]) => name)
			.slice(0, limit)
	);
}

/**
 * Raison pour laquelle `name` ne peut pas devenir une merveille perso (vide, trop long, déjà au
 * catalogue officiel, même sous un ancien nom, ou dans ses merveilles), `null` s'il est acceptable.
 */
export function getCustomWonderNameError(
	name: string,
	customWonders: readonly (Pick<CustomWonder, "name"> & { id?: string })[],
	/** Merveille renommée : son nom actuel n'est pas un doublon (correction de casse, d'accent). */
	ignoredId?: string,
): string | null {
	const trimmed = name.trim();
	if (!trimmed) return "Indique le nom de la merveille.";
	if (trimmed.length > MAX_WONDER_NAME_LENGTH) {
		return `${MAX_WONDER_NAME_LENGTH} caractères au maximum.`;
	}
	const key = normalizeWonderName(trimmed);
	const known =
		OFFICIAL_NAME_BY_KEY.has(key) ||
		customWonders.some(
			(wonder) =>
				(ignoredId === undefined || wonder.id !== ignoredId) &&
				normalizeWonderName(wonder.name) === key,
		);
	return known ? "Cette merveille existe déjà." : null;
}
