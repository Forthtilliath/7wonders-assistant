import * as Sharing from "expo-sharing";
import type { RefObject } from "react";
import { Share, type View } from "react-native";
import { EXTENSION_LABELS } from "@/constants/categories";
import { RANK_MEDALS } from "@/constants/game";
import { formatDate } from "@/lib/date";
import { getGameRanking } from "@/lib/scoring/game";
import type { Game, Player } from "@/types/game";

/**
 * Classement d'une partie en texte brut, lisible tel quel dans une messagerie :
 *
 *   7 Wonders · 11 octobre 2026
 *   Extensions : Leaders, Cités
 *
 *   🥇 Alice — 62 pts (Rhodes B)
 *   🥈 Bob — 55 pts
 *   4. David — 40 pts
 */
export function buildGameShareText(game: Game, players: Player[]): string {
	const lines = [`7 Wonders · ${formatDate(game.createdAt)}`];
	if (game.extensions.length > 0) {
		lines.push(`Extensions : ${game.extensions.map((ext) => EXTENSION_LABELS[ext]).join(", ")}`);
	}
	lines.push("");

	for (const score of getGameRanking(game)) {
		const name = players.find((p) => p.id === score.playerId)?.name ?? "Joueur supprimé";
		const wonder = game.entries[score.playerId]?.wonder;
		const wonderLabel = wonder?.name.trim()
			? ` (${[wonder.name.trim(), wonder.side].filter(Boolean).join(" ")})`
			: "";
		const rank = RANK_MEDALS[score.rank] ?? `${score.rank}.`;
		lines.push(`${rank} ${name} — ${score.total} pts${wonderLabel}`);
	}

	return lines.join("\n");
}

export async function shareGameText(game: Game, players: Player[]): Promise<void> {
	await Share.share({ message: buildGameShareText(game, players) });
}

/**
 * Capture la vue du classement en PNG et l'ouvre dans la feuille de partage du système. La lib est
 * chargée à la demande : elle exige son module natif dès l'import, ce qui ferait planter les écrans
 * qui l'importent sur un binaire compilé sans elle (ancienne build de dev) ; seul le partage en
 * image échoue alors.
 */
export async function shareViewAsImage(view: RefObject<View | null>): Promise<void> {
	const { captureRef }: typeof import("react-native-view-shot") = require("react-native-view-shot");
	const uri = await captureRef(view, { format: "png", quality: 1, result: "tmpfile" });
	if (await Sharing.isAvailableAsync()) {
		await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Partager le classement" });
	}
}
