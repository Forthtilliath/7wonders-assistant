import { createEmptyPlayerGameEntry } from "@/types/game";
import {
	type BackupData,
	DATA_VERSION,
	ImportError,
	isBackupDataShape,
	migrateBackupData,
	validateMigratedBackupData,
} from "../backupSchema";

function makeBackup(dataVersion: number): BackupData {
	return {
		app: "7wonders-assistant",
		dataVersion,
		exportedAt: 0,
		players: [],
		history: [],
		groups: [],
	};
}

describe("migrateBackupData", () => {
	it("ne touche pas une sauvegarde déjà à la version courante", () => {
		const data = makeBackup(DATA_VERSION);
		expect(migrateBackupData(data)).toBe(data);
	});

	it("migre une sauvegarde v1 (sans groupes) vers la version courante en ajoutant un tableau vide", () => {
		// Une vraie sauvegarde v1 n'a jamais eu de champ `groups` du tout (ajouté en v2).
		const v1Data = {
			app: "7wonders-assistant",
			dataVersion: 1,
			exportedAt: 0,
			players: [],
			history: [],
		} as unknown as BackupData;

		const migrated = migrateBackupData(v1Data);

		expect(migrated.dataVersion).toBe(DATA_VERSION);
		expect(migrated.groups).toEqual([]);
	});

	it("rejette une sauvegarde à une version antérieure sans étape de migration disponible", () => {
		// Aucune étape n'existe pour la version 0 : une version antérieure à la toute première doit
		// échouer proprement plutôt que charger des données incompatibles en silence — c'est
		// exactement le bug qu'on corrige par rapport à la V1.
		const data = makeBackup(0);
		expect(() => migrateBackupData(data)).toThrow(ImportError);
	});
});

describe("isBackupDataShape", () => {
	it("accepte une sauvegarde valide de cette app", () => {
		expect(isBackupDataShape(makeBackup(DATA_VERSION))).toBe(true);
	});

	it("rejette un fichier d'une autre app, ou mal formé", () => {
		expect(isBackupDataShape({ app: "autre-app" })).toBe(false);
		expect(isBackupDataShape({ app: "7wonders-assistant", players: [] })).toBe(false);
		expect(isBackupDataShape(null)).toBe(false);
		expect(isBackupDataShape("pas un objet")).toBe(false);
	});
});

describe("validateMigratedBackupData", () => {
	it("accepte une sauvegarde dont chaque joueur et partie a la forme attendue", () => {
		const data: BackupData = {
			...makeBackup(DATA_VERSION),
			players: [
				{
					id: "p1",
					name: "Alice",
					isFavorite: false,
					isArchived: false,
					createdAt: 0,
				},
			],
			history: [
				{
					id: "g1",
					createdAt: 0,
					extensions: ["armada"],
					playerIds: ["p1"],
					entries: { p1: createEmptyPlayerGameEntry("p1") },
				},
			],
		};

		expect(validateMigratedBackupData(data)).toEqual(data);
	});

	it("rejette un joueur dont un champ a le mauvais type", () => {
		const data = {
			...makeBackup(DATA_VERSION),
			players: [{ id: "p1", name: "Alice", isFavorite: "oui", isArchived: false, createdAt: 0 }],
		} as unknown as BackupData;

		expect(() => validateMigratedBackupData(data)).toThrow(ImportError);
	});

	it("rejette une partie dont une entrée de score est mal formée (fichier modifié à la main)", () => {
		const brokenEntry = { ...createEmptyPlayerGameEntry("p1"), military: { points: "beaucoup" } };
		const data = {
			...makeBackup(DATA_VERSION),
			history: [
				{ id: "g1", createdAt: 0, extensions: [], playerIds: ["p1"], entries: { p1: brokenEntry } },
			],
		} as unknown as BackupData;

		expect(() => validateMigratedBackupData(data)).toThrow(ImportError);
	});

	it("rejette une extension inconnue", () => {
		const data = {
			...makeBackup(DATA_VERSION),
			history: [{ id: "g1", createdAt: 0, extensions: ["babel"], playerIds: [], entries: {} }],
		} as unknown as BackupData;

		expect(() => validateMigratedBackupData(data)).toThrow(ImportError);
	});

	it("accepte un groupe de joueurs bien formé", () => {
		const data: BackupData = {
			...makeBackup(DATA_VERSION),
			groups: [{ id: "grp1", name: "Soirée jeudi", playerIds: ["p1", "p2"], createdAt: 0 }],
		};

		expect(validateMigratedBackupData(data)).toEqual(data);
	});

	it("rejette un groupe dont playerIds n'est pas un tableau", () => {
		const data = {
			...makeBackup(DATA_VERSION),
			groups: [{ id: "grp1", name: "Soirée jeudi", playerIds: "p1", createdAt: 0 }],
		} as unknown as BackupData;

		expect(() => validateMigratedBackupData(data)).toThrow(ImportError);
	});
});
