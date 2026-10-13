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

	it("migre une sauvegarde v2 (groupes sans isFavorite/isArchived) vers la version courante", () => {
		const v2Data = {
			app: "7wonders-assistant",
			dataVersion: 2,
			exportedAt: 0,
			players: [],
			history: [],
			groups: [{ id: "grp1", name: "Soirée jeudi", playerIds: ["p1"], createdAt: 0 }],
		} as unknown as BackupData;

		const migrated = migrateBackupData(v2Data);

		expect(migrated.dataVersion).toBe(DATA_VERSION);
		expect(migrated.groups).toEqual([
			{
				id: "grp1",
				name: "Soirée jeudi",
				playerIds: ["p1"],
				createdAt: 0,
				isFavorite: false,
				isArchived: false,
			},
		]);
	});

	it("migre une sauvegarde v3 (entrées sans catégorie islands) vers la version courante", () => {
		// Une vraie sauvegarde v3 n'a jamais eu de champ `islands` du tout (ajouté en v4).
		const { islands: _islands, ...v3Entry } = createEmptyPlayerGameEntry("p1");
		const v3Data = {
			app: "7wonders-assistant",
			dataVersion: 3,
			exportedAt: 0,
			players: [],
			groups: [],
			history: [
				{
					id: "g1",
					createdAt: 0,
					extensions: ["armada"],
					playerIds: ["p1"],
					entries: { p1: v3Entry },
				},
			],
		} as unknown as BackupData;

		const migrated = migrateBackupData(v3Data);

		expect(migrated.dataVersion).toBe(DATA_VERSION);
		expect(migrated.history[0].entries.p1.islands).toEqual({ points: 0 });
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
			groups: [
				{
					id: "grp1",
					name: "Soirée jeudi",
					playerIds: ["p1", "p2"],
					isFavorite: false,
					isArchived: false,
					createdAt: 0,
				},
			],
		};

		expect(validateMigratedBackupData(data)).toEqual(data);
	});

	it("rejette un groupe dont playerIds n'est pas un tableau", () => {
		const data = {
			...makeBackup(DATA_VERSION),
			groups: [
				{
					id: "grp1",
					name: "Soirée jeudi",
					playerIds: "p1",
					isFavorite: false,
					isArchived: false,
					createdAt: 0,
				},
			],
		} as unknown as BackupData;

		expect(() => validateMigratedBackupData(data)).toThrow(ImportError);
	});
});

describe("validateMigratedBackupData — bornes", () => {
	const player = { id: "p1", name: "Alice", isFavorite: false, isArchived: false, createdAt: 0 };

	const withScience = (scientifics: Record<string, number>) =>
		({
			...makeBackup(DATA_VERSION),
			history: [
				{
					id: "g1",
					createdAt: 0,
					extensions: [],
					playerIds: ["p1"],
					entries: {
						p1: {
							...createEmptyPlayerGameEntry("p1"),
							scientifics: { ...createEmptyPlayerGameEntry("p1").scientifics, ...scientifics },
						},
					},
				},
			],
		}) as unknown as BackupData;

	it("rejette un nombre de jokers qui gèlerait le calcul des sciences", () => {
		expect(() => validateMigratedBackupData(withScience({ wildcards: 100_000 }))).toThrow(
			ImportError,
		);
		expect(() => validateMigratedBackupData(withScience({ maxSymbols: 1e12 }))).toThrow(
			ImportError,
		);
		expect(() => validateMigratedBackupData(withScience({ wildcards: 3 }))).not.toThrow();
	});

	it("rejette un nom démesuré ou des points hors bornes", () => {
		const longName = {
			...makeBackup(DATA_VERSION),
			players: [{ ...player, name: "A".repeat(101) }],
		};
		expect(() => validateMigratedBackupData(longName)).toThrow(ImportError);

		const withMilitary = (points: number) =>
			({
				...makeBackup(DATA_VERSION),
				history: [
					{
						id: "g1",
						createdAt: 0,
						extensions: [],
						playerIds: ["p1"],
						entries: { p1: { ...createEmptyPlayerGameEntry("p1"), military: { points } } },
					},
				],
			}) as unknown as BackupData;
		expect(() => validateMigratedBackupData(withMilitary(1e9))).toThrow(ImportError);
		expect(() => validateMigratedBackupData(withMilitary(201))).toThrow(ImportError);
		expect(() => validateMigratedBackupData(withMilitary(-31))).toThrow(ImportError);
		expect(() => validateMigratedBackupData(withMilitary(200))).not.toThrow();
		expect(() => validateMigratedBackupData(withMilitary(-30))).not.toThrow();
	});

	it("n'accepte que des photos en base64 de taille raisonnable", () => {
		const withAvatar = (photo: string) => ({
			...makeBackup(DATA_VERSION),
			players: [player],
			avatars: { p1: photo },
		});

		expect(() => validateMigratedBackupData(withAvatar("/9j/4AAQSkZJRg=="))).not.toThrow();
		expect(() => validateMigratedBackupData(withAvatar("../../etc/passwd"))).toThrow(ImportError);
		expect(() => validateMigratedBackupData(withAvatar("A".repeat(1_000_001)))).toThrow(
			ImportError,
		);
	});

	it("supprime les clés inconnues", () => {
		const data = {
			...makeBackup(DATA_VERSION),
			players: [{ ...player, admin: true }],
		} as unknown as BackupData;

		expect(validateMigratedBackupData(data).players[0]).toEqual(player);
	});
});
