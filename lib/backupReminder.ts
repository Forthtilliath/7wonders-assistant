import type { Game } from "@/types/game";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Âge (en jours) à partir duquel une partie non sauvegardée déclenche le rappel. */
export const REMINDER_AFTER_DAYS = 7;
/** Nombre de parties non sauvegardées qui déclenche le rappel, même si elles sont récentes. */
export const REMINDER_AFTER_GAMES = 5;
/** Durée pendant laquelle "Plus tard" masque le rappel. */
export const REMINDER_SNOOZE_DAYS = 7;

function gameDate(game: Game): number {
	return game.finishedAt ?? game.createdAt;
}

/** Parties terminées après la dernière sauvegarde connue (toutes si aucune sauvegarde). */
export function getUnsavedGames(games: Game[], lastBackupAt: number | null): Game[] {
	return games.filter((game) => gameDate(game) > (lastBackupAt ?? 0));
}

type ReminderInput = {
	games: Game[];
	lastBackupAt: number | null;
	snoozedUntil: number | null;
	now: number;
};

/**
 * Affiche le rappel quand des parties sont "à risque" (perdues en cas de changement de téléphone)
 * depuis assez longtemps, ou quand elles s'accumulent. Ne dépend pas de l'activation de Google
 * Drive : quand l'envoi automatique fonctionne, `lastBackupAt` suit chaque partie et le rappel ne
 * s'affiche jamais ; quand il échoue (hors ligne, accès révoqué…), le rappel prend le relais.
 */
export function shouldShowBackupReminder({
	games,
	lastBackupAt,
	snoozedUntil,
	now,
}: ReminderInput): boolean {
	if (snoozedUntil != null && now < snoozedUntil) return false;

	const unsaved = getUnsavedGames(games, lastBackupAt);
	if (unsaved.length === 0) return false;
	if (unsaved.length >= REMINDER_AFTER_GAMES) return true;

	const oldest = Math.min(...unsaved.map(gameDate));
	return now - oldest >= REMINDER_AFTER_DAYS * DAY_MS;
}

export function snoozeUntil(now: number): number {
	return now + REMINDER_SNOOZE_DAYS * DAY_MS;
}
