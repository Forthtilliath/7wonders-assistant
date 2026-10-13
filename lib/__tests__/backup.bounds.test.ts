import { createEmptyPlayerGameEntry } from "@/types/game";
import {
	type BackupData,
	DATA_VERSION,
	ImportError,
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

	it("rejette un nombre de tuiles Babel hors du barème", () => {
		const withBabel = (tiles: number) =>
			({
				...makeBackup(DATA_VERSION),
				history: [
					{
						id: "g1",
						createdAt: 0,
						extensions: ["babel"],
						playerIds: ["p1"],
						entries: { p1: { ...createEmptyPlayerGameEntry("p1"), babel: { tiles } } },
					},
				],
			}) as unknown as BackupData;

		expect(() => validateMigratedBackupData(withBabel(3))).not.toThrow();
		expect(() => validateMigratedBackupData(withBabel(4))).toThrow(ImportError);
		expect(() => validateMigratedBackupData(withBabel(1.5))).toThrow(ImportError);
	});

	it("supprime les clés inconnues", () => {
		const data = {
			...makeBackup(DATA_VERSION),
			players: [{ ...player, admin: true }],
		} as unknown as BackupData;

		expect(validateMigratedBackupData(data).players[0]).toEqual(player);
	});
});
