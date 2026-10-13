import { render, screen, userEvent } from "@testing-library/react-native";
import BackupSettingsScreen from "@/app/(tabs)/settings/backup";
import { backup, exportGamesCsv } from "@/lib/backup";
import { APP_ID, type BackupData, DATA_VERSION } from "@/lib/backupSchema";
import { makePlayer, mockAlert, pressAlertButton, resetAllStores } from "@/test-utils/fixtures";

// L'écran est celui d'expo-backup-ui (testé dans son paquet) : ici, un faux gestionnaire vérifie
// seulement son branchement sur les données de l'app (résumé des sauvegardes, export CSV).
jest.mock("@/lib/backup", () => {
	const state = {
		hydrated: true,
		cloudAccount: null,
		encryptionEnabled: false,
		lastBackupAt: null,
		lastCloudBackupAt: null,
		cloudPending: false,
		cloudError: null,
		hasSafetyBackup: false,
	};
	return {
		backup: {
			appId: "7wonders",
			encryptionMode: "optional",
			getState: () => state,
			subscribe: () => () => {},
			isEncryptionActive: () => false,
			exportToFile: jest.fn(async () => {}),
			pickBackupFile: jest.fn(),
			restore: jest.fn(async () => {}),
		},
		describeBackup: jest.requireActual("@/lib/backup").describeBackup,
		exportGamesCsv: jest.fn(async () => {}),
	};
});

const picked: BackupData = {
	app: APP_ID,
	dataVersion: DATA_VERSION,
	exportedAt: Date.UTC(2026, 8, 1),
	players: [makePlayer("r1", "Distant")],
	history: [],
	groups: [],
};

describe("Réglages ▸ Sauvegardes", () => {
	beforeEach(() => {
		resetAllStores();
		jest.clearAllMocks();
	});

	it("propose la sauvegarde Google Drive et la sauvegarde manuelle", async () => {
		await render(<BackupSettingsScreen />);

		expect(screen.getByRole("button", { name: "Exporter mes données" })).toBeOnTheScreen();
		expect(screen.getByRole("button", { name: "Importer une sauvegarde" })).toBeOnTheScreen();
		expect(screen.getByRole("button", { name: "Connecter Google Drive" })).toBeOnTheScreen();
	});

	it("exporte les données en JSON", async () => {
		const user = userEvent.setup();
		await render(<BackupSettingsScreen />);

		await user.press(screen.getByRole("button", { name: "Exporter mes données" }));

		expect(backup.exportToFile).toHaveBeenCalled();
	});

	it("résume la sauvegarde importée avant de remplacer les données", async () => {
		const user = userEvent.setup();
		const alert = mockAlert();
		jest.mocked(backup.pickBackupFile).mockResolvedValue({ status: "ready", data: picked });
		await render(<BackupSettingsScreen />);

		await user.press(screen.getByRole("button", { name: "Importer une sauvegarde" }));
		expect(alert.mock.calls[0][1]).toContain("1 joueur(s), 0 groupe(s), 0 partie(s)");

		await pressAlertButton(alert, "Restaurer");
		expect(backup.restore).toHaveBeenCalledWith(picked, { source: "file" });
	});

	it("exporte les scores en CSV, et signale un échec", async () => {
		const user = userEvent.setup();
		const alert = mockAlert();
		await render(<BackupSettingsScreen />);

		await user.press(screen.getByRole("button", { name: "Exporter les scores en CSV" }));
		expect(exportGamesCsv).toHaveBeenCalled();

		jest.mocked(exportGamesCsv).mockRejectedValueOnce(new Error("disque plein"));
		await user.press(screen.getByRole("button", { name: "Exporter les scores en CSV" }));
		expect(alert).toHaveBeenCalledWith("Erreur", "L'export CSV a échoué.");
	});
});
