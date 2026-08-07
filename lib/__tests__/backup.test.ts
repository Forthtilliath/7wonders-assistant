import {
	type BackupData,
	DATA_VERSION,
	ImportError,
	isBackupDataShape,
	migrateBackupData,
} from "../backupSchema";

function makeBackup(dataVersion: number): BackupData {
	return {
		app: "7wonders-assistant",
		dataVersion,
		exportedAt: 0,
		players: [],
		history: [],
	};
}

describe("migrateBackupData", () => {
	it("ne touche pas une sauvegarde déjà à la version courante", () => {
		const data = makeBackup(DATA_VERSION);
		expect(migrateBackupData(data)).toBe(data);
	});

	it("rejette une sauvegarde à une version antérieure sans étape de migration disponible", () => {
		// Aucune étape n'existe encore (v1 est la toute première version du format) : une version
		// plus ancienne que DATA_VERSION doit échouer proprement plutôt que charger des données
		// incompatibles en silence — c'est exactement le bug qu'on corrige par rapport à la V1.
		const data = makeBackup(DATA_VERSION - 1);
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
