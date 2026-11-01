import type { MigrationSteps } from "@/lib/persistedState";
import { BACKUP_STORE_MIGRATIONS, BACKUP_STORE_VERSION } from "../backupStore";
import { GAME_STORE_MIGRATIONS, GAME_STORE_VERSION } from "../gameStore";
import { GROUPS_STORE_MIGRATIONS, GROUPS_STORE_VERSION } from "../groupsStore";
import { HISTORY_STORE_MIGRATIONS, HISTORY_STORE_VERSION } from "../historyStore";
import { PLAYERS_STORE_MIGRATIONS, PLAYERS_STORE_VERSION } from "../playersStore";
import { PREFERENCES_STORE_MIGRATIONS, PREFERENCES_STORE_VERSION } from "../preferencesStore";
import { THEME_STORE_MIGRATIONS, THEME_STORE_VERSION } from "../themeStore";
import { UPDATE_STORE_MIGRATIONS, UPDATE_STORE_VERSION } from "../updateStore";
import { WONDERS_STORE_MIGRATIONS, WONDERS_STORE_VERSION } from "../wondersStore";

// Une hausse de version sans son étape effacerait les données de tous les joueurs à la mise à
// jour : ce test échoue tant que l'étape `version - 1` manque, ou qu'un trou coupe la chaîne.
const STORES: [string, number, MigrationSteps][] = [
	["backup", BACKUP_STORE_VERSION, BACKUP_STORE_MIGRATIONS],
	["game", GAME_STORE_VERSION, GAME_STORE_MIGRATIONS],
	["groups", GROUPS_STORE_VERSION, GROUPS_STORE_MIGRATIONS],
	["history", HISTORY_STORE_VERSION, HISTORY_STORE_MIGRATIONS],
	["players", PLAYERS_STORE_VERSION, PLAYERS_STORE_MIGRATIONS],
	["preferences", PREFERENCES_STORE_VERSION, PREFERENCES_STORE_MIGRATIONS],
	["theme", THEME_STORE_VERSION, THEME_STORE_MIGRATIONS],
	["update", UPDATE_STORE_VERSION, UPDATE_STORE_MIGRATIONS],
	["wonders", WONDERS_STORE_VERSION, WONDERS_STORE_MIGRATIONS],
];

describe.each(STORES)("store %s", (_name, version, steps) => {
	const versions = Object.keys(steps).map(Number);
	const oldest = Math.min(version, ...versions);

	it("a une étape pour chaque version, de la plus ancienne reprise à la courante", () => {
		for (let v = oldest; v < version; v++) expect(steps[v]).toBeDefined();
		if (version > 1) expect(oldest).toBeLessThan(version);
	});

	it("n'a pas d'étape au-delà de la version courante", () => {
		expect(versions.every((v) => v < version)).toBe(true);
	});
});
