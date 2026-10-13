import { MAX_WONDER_NAME_LENGTH, OFFICIAL_WONDERS, type WonderSource } from "@/constants/wonders";
import type { CustomWonder, ExtensionId, Game, GameEdition } from "@/types/game";

/** Merveille proposée à la saisie, avec son origine. */
export type WonderOption = {
	name: string;
	source: WonderSource;
};

/** Clé de comparaison d'un nom : sans espaces autour, sans casse ni accents ("eph" trouve Éphèse). */
export function normalizeWonderName(name: string): string {
	return name.trim().normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
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
			.filter(
				([key]) => key.includes(normalizedQuery) && key !== normalizedQuery && !excluded.has(key),
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
 * catalogue officiel ou dans ses merveilles), `null` s'il est acceptable.
 */
export function getCustomWonderNameError(
	name: string,
	customWonders: readonly Pick<CustomWonder, "name">[],
): string | null {
	const trimmed = name.trim();
	if (!trimmed) return "Indique le nom de la merveille.";
	if (trimmed.length > MAX_WONDER_NAME_LENGTH) {
		return `${MAX_WONDER_NAME_LENGTH} caractères au maximum.`;
	}
	const key = normalizeWonderName(trimmed);
	const known = [...OFFICIAL_WONDERS, ...customWonders].some(
		(wonder) => normalizeWonderName(wonder.name) === key,
	);
	return known ? "Cette merveille existe déjà." : null;
}
