import {
	type BackupData,
	DATA_VERSION,
	ImportError,
	validateMigratedBackupData,
} from "../backupSchema";

function makeBackup(): BackupData {
	return {
		app: "7wonders-assistant",
		dataVersion: DATA_VERSION,
		exportedAt: 0,
		players: [],
		history: [],
		groups: [],
	};
}

describe("validateMigratedBackupData — merveilles perso", () => {
	it("accepte des merveilles perso bien formées, et leur absence (anciennes sauvegardes)", () => {
		const data: BackupData = {
			...makeBackup(),
			customWonders: [{ id: "w1", name: "Atlantide", createdAt: 0 }],
		};
		expect(validateMigratedBackupData(data)).toEqual(data);
		expect(validateMigratedBackupData(makeBackup()).customWonders).toBeUndefined();
	});

	it("rejette une merveille perso au nom vide, trop long ou au mauvais type", () => {
		const withWonder = (wonder: unknown) =>
			({ ...makeBackup(), customWonders: [wonder] }) as unknown as BackupData;

		expect(() =>
			validateMigratedBackupData(withWonder({ id: "w1", name: "  ", createdAt: 0 })),
		).toThrow(ImportError);
		expect(() =>
			validateMigratedBackupData(withWonder({ id: "w1", name: "A".repeat(101), createdAt: 0 })),
		).toThrow(ImportError);
		expect(() =>
			validateMigratedBackupData(withWonder({ id: "w1", name: 42, createdAt: 0 })),
		).toThrow(ImportError);
	});

	it("retire les clés inconnues d'une merveille perso", () => {
		const data = {
			...makeBackup(),
			customWonders: [{ id: "w1", name: "Atlantide", createdAt: 0, evil: "<script>" }],
		} as unknown as BackupData;

		expect(validateMigratedBackupData(data).customWonders).toEqual([
			{ id: "w1", name: "Atlantide", createdAt: 0 },
		]);
	});
});
