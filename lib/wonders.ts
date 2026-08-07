import type { Game } from "@/types/game";

/**
 * Suggestions de noms de merveille déjà saisis dans l'historique, pour réduire les doublons dus à
 * des fautes de frappe dans les statistiques par merveille. Vide tant que rien n'est tapé (pas
 * d'intérêt à lister 60 merveilles avant que l'utilisateur ait commencé à écrire).
 */
export function getWonderNameSuggestions(games: Game[], query: string, limit = 5): string[] {
	const normalizedQuery = query.trim().toLowerCase();
	if (!normalizedQuery) return [];

	// Dédoublonne en ignorant la casse, en gardant la première casse rencontrée.
	const namesByKey = new Map<string, string>();
	for (const game of games) {
		for (const entry of Object.values(game.entries)) {
			const name = entry.wonder.name.trim();
			if (!name) continue;
			const key = name.toLowerCase();
			if (!namesByKey.has(key)) namesByKey.set(key, name);
		}
	}

	return Array.from(namesByKey.values())
		.filter((name) => {
			const lower = name.toLowerCase();
			return lower.includes(normalizedQuery) && lower !== normalizedQuery;
		})
		.sort((a, b) => a.localeCompare(b))
		.slice(0, limit);
}
