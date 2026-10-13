import { escapeCsvField } from "@forthtilliath/ts-kit/csv/escapeCsvField";
import { EXTENSION_LABELS } from "@/constants/categories";
import { getGameRanking } from "@/lib/scoring/game";
import type { Game, Player } from "@/types/game";

const HEADER = [
	"Date",
	"Nombre de joueurs",
	"Extensions",
	"Joueur",
	"Merveille",
	"Face",
	"Militaire",
	"Maritime",
	"Trésor",
	"Merveille (pts)",
	"Civils",
	"Commerce",
	"Science",
	"Guildes",
	"Leaders",
	"Cités",
	"Babel",
	"Armada",
	"Total",
	"Classement",
];

function isoDate(timestamp: number): string {
	return new Date(timestamp).toISOString().slice(0, 10);
}

/**
 * Génère un CSV (une ligne par joueur par partie) à partir de l'historique complet, pour ouvrir
 * les scores dans un tableur. BOM UTF-8 en tête pour qu'Excel affiche correctement les accents.
 */
export function buildGamesCsv(games: Game[], players: Player[]): string {
	const rows = [HEADER];

	for (const game of games) {
		const ranking = getGameRanking(game);
		const extensionLabels = game.extensions.map((ext) => EXTENSION_LABELS[ext]).join(" + ");

		for (const score of ranking) {
			const player = players.find((p) => p.id === score.playerId);
			const entry = game.entries[score.playerId];

			rows.push([
				isoDate(game.createdAt),
				String(game.playerIds.length),
				extensionLabels,
				player?.name ?? "Joueur supprimé",
				entry?.wonder.name ?? "",
				entry?.wonder.side ?? "",
				String(score.military),
				String(score.naval),
				String(score.treasury),
				String(score.wonders),
				String(score.civilians),
				String(score.commercials),
				String(score.scientifics),
				String(score.guilds),
				String(score.leaders),
				String(score.cities),
				String(score.babel),
				String(score.armada),
				String(score.total),
				String(score.rank),
			]);
		}
	}

	const csv = rows.map((row) => row.map((field) => escapeCsvField(field)).join(";")).join("\r\n");
	const UTF8_BOM = "﻿";
	return UTF8_BOM + csv;
}
