import { createEmptyPlayerGameEntry, type Game } from "@/types/game";
import {
	getUnsavedGames,
	REMINDER_AFTER_DAYS,
	REMINDER_AFTER_GAMES,
	shouldShowBackupReminder,
	snoozeUntil,
} from "../backupReminder";

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 9, 11);

function makeGame(id: string, finishedAt: number): Game {
	return {
		id,
		createdAt: finishedAt - 60 * 60 * 1000,
		finishedAt,
		extensions: [],
		playerIds: ["p1"],
		entries: { p1: createEmptyPlayerGameEntry("p1") },
	};
}

describe("getUnsavedGames", () => {
	it("considère toutes les parties comme non sauvegardées sans sauvegarde", () => {
		const games = [makeGame("g1", NOW - DAY), makeGame("g2", NOW)];
		expect(getUnsavedGames(games, null)).toHaveLength(2);
	});

	it("ne garde que les parties terminées après la dernière sauvegarde", () => {
		const games = [makeGame("g1", NOW - 3 * DAY), makeGame("g2", NOW)];
		expect(getUnsavedGames(games, NOW - DAY).map((g) => g.id)).toEqual(["g2"]);
	});
});

describe("shouldShowBackupReminder", () => {
	const base = { lastBackupAt: null, snoozedUntil: null, now: NOW };

	it("ne s'affiche pas sans partie", () => {
		expect(shouldShowBackupReminder({ ...base, games: [] })).toBe(false);
	});

	it("ne s'affiche pas pour une partie récente isolée", () => {
		expect(shouldShowBackupReminder({ ...base, games: [makeGame("g1", NOW - DAY)] })).toBe(false);
	});

	it("s'affiche quand une partie attend depuis assez longtemps", () => {
		const games = [makeGame("g1", NOW - REMINDER_AFTER_DAYS * DAY)];
		expect(shouldShowBackupReminder({ ...base, games })).toBe(true);
	});

	it("s'affiche quand les parties récentes s'accumulent", () => {
		const games = Array.from({ length: REMINDER_AFTER_GAMES }, (_, i) => makeGame(`g${i}`, NOW));
		expect(shouldShowBackupReminder({ ...base, games })).toBe(true);
	});

	it("ne s'affiche pas quand tout est sauvegardé", () => {
		const games = [makeGame("g1", NOW - 30 * DAY)];
		expect(shouldShowBackupReminder({ ...base, games, lastBackupAt: NOW - DAY })).toBe(false);
	});

	it("reste masqué pendant la période de report, puis revient", () => {
		const games = [makeGame("g1", NOW - 30 * DAY)];
		const snoozedUntil = snoozeUntil(NOW);
		expect(shouldShowBackupReminder({ ...base, games, snoozedUntil })).toBe(false);
		expect(shouldShowBackupReminder({ ...base, games, snoozedUntil, now: snoozedUntil })).toBe(
			true,
		);
	});
});
