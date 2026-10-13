import { Share } from "react-native";
import { CATEGORY_META, EXTENSION_LABELS, getOrderedCategories } from "@/constants/categories";
import { RANK_MEDALS } from "@/constants/game";
import { formatDate } from "@/lib/date";
import { getGameRanking } from "@/lib/scoring/game";
import { getCategoryScore } from "@/lib/scoring/total";
import type { Game, Player } from "@/types/game";

/**
 * Classement d'une partie en texte brut, lisible tel quel dans une messagerie :
 *
 *   7 Wonders · 11 octobre 2026
 *   Extensions : Leaders, Cities
 *
 *   🥇 Alice — 62 pts (Rhodes B)
 *      Militaire 6 · Civil 30 · Science 26
 *   🥈 Bob — 55 pts
 *      Trésor 5 · Commerce 20 · Guildes 30
 *   4. David — 40 pts
 *      Civil 40
 *
 * Seules les catégories qui rapportent ou coûtent des points sont détaillées, comme sur les
 * cartes du classement.
 */
export function buildGameShareText(game: Game, players: Player[]): string {
	const lines = [`7 Wonders · ${formatDate(game.createdAt)}`];
	if (game.extensions.length > 0) {
		lines.push(`Extensions : ${game.extensions.map((ext) => EXTENSION_LABELS[ext]).join(", ")}`);
	}
	lines.push("");
	const categories = getOrderedCategories(game.extensions);

	for (const score of getGameRanking(game)) {
		const name = players.find((p) => p.id === score.playerId)?.name ?? "Joueur supprimé";
		const wonder = game.entries[score.playerId]?.wonder;
		const wonderLabel = wonder?.name.trim()
			? ` (${[wonder.name.trim(), wonder.side].filter(Boolean).join(" ")})`
			: "";
		const rank = RANK_MEDALS[score.rank] ?? `${score.rank}.`;
		lines.push(`${rank} ${name} — ${score.total} pts${wonderLabel}`);

		const details = categories
			.map((category) => ({ category, value: getCategoryScore(score, category) }))
			.filter(({ value }) => value !== 0)
			.map(({ category, value }) => `${CATEGORY_META[category].shortLabel} ${value}`);
		if (details.length > 0) lines.push(`   ${details.join(" · ")}`);
	}

	return lines.join("\n");
}

export async function shareGameText(game: Game, players: Player[]): Promise<void> {
	await Share.share({ message: buildGameShareText(game, players) });
}
