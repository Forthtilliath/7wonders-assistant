import { MAX_WONDER_NAME_LENGTH, OFFICIAL_WONDERS, type WonderSource } from "@/constants/wonders";
import type { CustomWonder, CustomWonderPack, ExtensionId, Game, GameEdition } from "@/types/game";

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
 * extensions actives, Wonder Pack) puis celles de l'utilisateur hors extensions non officielles
 * désactivées, par ordre alphabétique. Une merveille perso homonyme d'une officielle n'est pas
 * répétée.
 */
export function getAvailableWonders(
	edition: GameEdition,
	extensions: readonly ExtensionId[],
	customWonders: readonly CustomWonder[],
	packs: readonly CustomWonderPack[],
): WonderOption[] {
	const official: WonderOption[] = OFFICIAL_WONDERS.filter(
		(wonder) =>
			wonder.editions.includes(edition) &&
			(wonder.source === "base" ||
				wonder.source === "wonderPack" ||
				extensions.includes(wonder.source)),
	).map(({ name, source }) => ({ name, source }));

	const officialKeys = new Set(official.map((w) => normalizeWonderName(w.name)));
	const enabledPackIds = new Set(packs.filter((p) => p.enabled).map((p) => p.id));
	const custom: WonderOption[] = customWonders
		.filter((w) => !w.packId || enabledPackIds.has(w.packId))
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
	limit?: number;
};

/**
 * Suggestions de noms pour le champ Merveille, pour éviter les doublons dus à des fautes de frappe
 * dans les statistiques par merveille. Champ vide : toutes les merveilles jouables encore libres.
 * Sinon : celles qui contiennent la recherche, merveilles jouables d'abord puis noms de
 * l'historique, sans répéter le nom déjà tapé.
 */
export function getWonderNameSuggestions({
	options,
	games,
	query,
	takenNames = [],
	limit = 8,
}: SuggestionsInput): string[] {
	const excluded = new Set(takenNames.map(normalizeWonderName));
	const normalizedQuery = normalizeWonderName(query);

	// Dédoublonne en ignorant casse et accents, en gardant la première écriture rencontrée.
	const namesByKey = new Map<string, string>();
	const add = (name: string) => {
		const key = normalizeWonderName(name);
		if (key && !namesByKey.has(key)) namesByKey.set(key, name.trim());
	};
	for (const option of options) add(option.name);

	if (!normalizedQuery) {
		return Array.from(namesByKey.entries())
			.filter(([key]) => !excluded.has(key))
			.map(([, name]) => name);
	}

	const historyNames = games
		.flatMap((game) => Object.values(game.entries).map((entry) => entry.wonder.name))
		.filter((name) => name.trim())
		.sort((a, b) => a.localeCompare(b));
	for (const name of historyNames) add(name);

	return Array.from(namesByKey.entries())
		.filter(
			([key]) => key.includes(normalizedQuery) && key !== normalizedQuery && !excluded.has(key),
		)
		.map(([, name]) => name)
		.slice(0, limit);
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
