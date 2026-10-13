import type { PlayerGameEntry } from "@/types/game";

/** Saisie d'avant l'extension Babel, sans le nombre de tuiles posées. */
export type PreBabelEntry = Omit<PlayerGameEntry, "babel">;

/** Ajoute la catégorie Babel (aucune tuile) à une saisie qui ne l'a pas encore. */
export function addBabelCategory(entry: PreBabelEntry): PlayerGameEntry {
	// Données pas encore validées (import de sauvegarde) : on laisse passer une saisie mal formée,
	// que la validation zod rejettera ensuite avec un message précis.
	if (typeof entry !== "object" || entry === null) return entry;
	return { ...entry, babel: { tiles: 0 } };
}

/** Applique `addBabelCategory` à toutes les saisies d'une partie, indexées par joueur. */
export function addBabelCategoryToEntries(
	entries: Record<string, PreBabelEntry>,
): Record<string, PlayerGameEntry> {
	return Object.fromEntries(
		Object.entries(entries).map(([id, entry]) => [id, addBabelCategory(entry)]),
	);
}
