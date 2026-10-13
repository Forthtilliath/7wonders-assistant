import {
	MAX_CUSTOM_WONDERS,
	MAX_WONDER_PACK_NAME_LENGTH,
	MAX_WONDER_PACKS,
	OFFICIAL_WONDERS,
} from "@/constants/wonders";
import type { CustomWonder, CustomWonderPack } from "@/types/game";
import type { WonderStats } from "./stats";
import { getCustomWonderNameError, normalizeWonderName } from "./wonders";

/** Liste de noms collée ou tapée, une merveille par ligne : lignes vides ignorées. */
export function parseWonderNameList(text: string): string[] {
	return text
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean);
}

export type CustomWondersPlan = {
	/** Noms à ajouter, dans l'ordre saisi. */
	accepted: string[];
	/** Noms écartés (doublon, trop long, limite atteinte…) avec la raison. */
	rejected: { name: string; reason: string }[];
};

/**
 * Trie une liste de noms entre ceux qui peuvent devenir des merveilles perso et ceux à écarter,
 * en tenant compte des doublons à l'intérieur de la liste elle-même et du nombre maximal de
 * merveilles perso.
 */
export function planCustomWonders(
	names: readonly string[],
	customWonders: readonly CustomWonder[],
): CustomWondersPlan {
	const accepted: string[] = [];
	const rejected: CustomWondersPlan["rejected"] = [];
	// Les noms déjà acceptés comptent comme existants pour repérer un doublon dans la liste.
	const known: Pick<CustomWonder, "name">[] = [...customWonders];

	for (const name of names) {
		if (known.length >= MAX_CUSTOM_WONDERS) {
			rejected.push({ name, reason: `${MAX_CUSTOM_WONDERS} merveilles perso au maximum.` });
			continue;
		}
		const error = getCustomWonderNameError(name, known);
		if (error) {
			rejected.push({ name, reason: error });
			continue;
		}
		accepted.push(name.trim());
		known.push({ name });
	}

	return { accepted, rejected };
}

/** Raison pour laquelle `name` ne peut pas nommer une nouvelle extension non officielle, `null` sinon. */
export function getWonderPackNameError(
	name: string,
	packs: readonly CustomWonderPack[],
	/** Extension renommée : son nom actuel n'est pas un doublon. */
	ignoredId?: string,
): string | null {
	const trimmed = name.trim();
	if (!trimmed) return "Indique le nom de l'extension.";
	if (trimmed.length > MAX_WONDER_PACK_NAME_LENGTH) {
		return `${MAX_WONDER_PACK_NAME_LENGTH} caractères au maximum.`;
	}
	const others = packs.filter((p) => p.id !== ignoredId);
	const key = normalizeWonderName(trimmed);
	if (others.some((p) => normalizeWonderName(p.name) === key)) {
		return "Cette extension existe déjà.";
	}
	if (!ignoredId && packs.length >= MAX_WONDER_PACKS) {
		return `${MAX_WONDER_PACKS} extensions au maximum.`;
	}
	return null;
}

/** Groupes du filtre des statistiques par merveille. Une extension non officielle a pour clé
 * `pack:<id>`. */
export const WONDER_GROUP_ALL = "all";
export const WONDER_GROUP_OFFICIAL = "official";
export const WONDER_GROUP_CUSTOM = "custom";
/** Noms saisis à la main qui ne sont ni au catalogue officiel ni dans les merveilles perso. */
export const WONDER_GROUP_OTHER = "other";

export type WonderGroup = { key: string; label: string };

const packGroupKey = (packId: string) => `pack:${packId}`;

/** Groupe de chaque merveille connue, par nom normalisé. */
export function buildWonderGroupIndex(
	customWonders: readonly CustomWonder[],
	packs: readonly CustomWonderPack[],
): Map<string, string> {
	const packIds = new Set(packs.map((p) => p.id));
	const index = new Map<string, string>();
	for (const wonder of OFFICIAL_WONDERS) {
		index.set(normalizeWonderName(wonder.name), WONDER_GROUP_OFFICIAL);
	}
	for (const wonder of customWonders) {
		const key = normalizeWonderName(wonder.name);
		if (index.has(key)) continue;
		const inPack = wonder.packId && packIds.has(wonder.packId);
		index.set(key, inPack ? packGroupKey(wonder.packId as string) : WONDER_GROUP_CUSTOM);
	}
	return index;
}

export function getWonderGroupKey(name: string, index: ReadonlyMap<string, string>): string {
	return index.get(normalizeWonderName(name)) ?? WONDER_GROUP_OTHER;
}

/**
 * Groupes proposés au filtre des statistiques par merveille : « Toutes », puis seulement les groupes
 * qui ont au moins une merveille jouée (officielles, chaque extension non officielle par ordre
 * alphabétique, merveilles perso sans extension, autres noms).
 */
export function getWonderStatGroups(
	stats: readonly WonderStats[],
	index: ReadonlyMap<string, string>,
	packs: readonly CustomWonderPack[],
): WonderGroup[] {
	const played = new Set(stats.map((s) => getWonderGroupKey(s.name, index)));
	const sortedPacks = [...packs].sort((a, b) => a.name.localeCompare(b.name));
	const candidates: WonderGroup[] = [
		{ key: WONDER_GROUP_OFFICIAL, label: "Officielles" },
		...sortedPacks.map((p) => ({ key: packGroupKey(p.id), label: p.name })),
		{ key: WONDER_GROUP_CUSTOM, label: "Mes merveilles" },
		{ key: WONDER_GROUP_OTHER, label: "Autres" },
	];
	return [
		{ key: WONDER_GROUP_ALL, label: "Toutes" },
		...candidates.filter((g) => played.has(g.key)),
	];
}

export function filterWonderStatsByGroup(
	stats: readonly WonderStats[],
	index: ReadonlyMap<string, string>,
	groupKey: string,
): WonderStats[] {
	if (groupKey === WONDER_GROUP_ALL) return [...stats];
	return stats.filter((s) => getWonderGroupKey(s.name, index) === groupKey);
}
