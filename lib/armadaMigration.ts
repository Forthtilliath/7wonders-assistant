import type { PlayerGameEntry } from "@/types/game";

/**
 * Saisie d'avant le renommage des catégories Armada : `armada` contenait les jetons de conflit
 * naval (onglet Maritime) et `islands` le plateau Armada + cartes Îles (onglet Armada).
 */
export type LegacyArmadaEntry = Omit<PlayerGameEntry, "naval" | "armada"> & {
	armada: { points: number };
	islands: { points: number };
};

/** Renomme les catégories d'une saisie : `armada` → `naval`, puis `islands` → `armada`. */
export function renameArmadaCategories(entry: LegacyArmadaEntry): PlayerGameEntry {
	// Données pas encore validées (import de sauvegarde) : on laisse passer une saisie mal formée,
	// que la validation zod rejettera ensuite avec un message précis.
	if (typeof entry !== "object" || entry === null) return entry;
	const { armada, islands, ...rest } = entry;
	return { ...rest, naval: armada, armada: islands };
}

/** Applique `renameArmadaCategories` à toutes les saisies d'une partie, indexées par joueur. */
export function renameArmadaCategoriesInEntries(
	entries: Record<string, LegacyArmadaEntry>,
): Record<string, PlayerGameEntry> {
	return Object.fromEntries(
		Object.entries(entries).map(([id, entry]) => [id, renameArmadaCategories(entry)]),
	);
}
