import { render, screen, userEvent } from "@testing-library/react-native";
import BackupSettingsScreen from "@/app/(tabs)/settings/backup";
import { exportData, exportGamesCsv, importData, restoreSafetyBackup } from "@/lib/backup";
import { APP_ID, type BackupData, DATA_VERSION, ImportError } from "@/lib/backupSchema";
import {
	connectGoogleDrive,
	connectWithLocalData,
	connectWithRemoteBackup,
	disconnectGoogleDrive,
	fetchCloudBackup,
	restoreFromCloud,
	syncCloudBackupNow,
} from "@/lib/cloudBackup";
import { useBackupStore } from "@/stores/backupStore";
import { makePlayer, mockAlert, pressAlertButton, resetAllStores } from "@/test-utils/fixtures";

jest.mock("@/lib/backup", () => ({
	exportData: jest.fn(),
	exportGamesCsv: jest.fn(),
	importData: jest.fn(),
	restoreSafetyBackup: jest.fn(),
}));
jest.mock("@/lib/cloudBackup", () => ({
	cloudErrorMessage: (error: Error) => error.message,
	connectGoogleDrive: jest.fn(),
	connectWithLocalData: jest.fn(),
	connectWithRemoteBackup: jest.fn(),
	disconnectGoogleDrive: jest.fn(),
	fetchCloudBackup: jest.fn(),
	restoreFromCloud: jest.fn(),
	syncCloudBackupNow: jest.fn(),
}));

const SUMMARY = { players: 3, groups: 1, history: 12 };

const remote: BackupData = {
	app: APP_ID,
	dataVersion: DATA_VERSION,
	exportedAt: Date.UTC(2026, 8, 1),
	players: [makePlayer("r1", "Distant")],
	history: [],
	groups: [],
};

const alertTitles = (alert: ReturnType<typeof mockAlert>) => alert.mock.calls.map(([t]) => t);

describe("Réglages ▸ Sauvegardes", () => {
	beforeEach(() => {
		resetAllStores();
		jest.clearAllMocks();
	});

	describe("sauvegarde manuelle", () => {
		it("indique la date de la dernière sauvegarde", async () => {
			await render(<BackupSettingsScreen />);
			expect(screen.getByText(/Dernière sauvegarde : jamais/)).toBeOnTheScreen();
		});

		it("exporte les données en JSON et les scores en CSV", async () => {
			const user = userEvent.setup();
			await render(<BackupSettingsScreen />);

			await user.press(screen.getByRole("button", { name: "Exporter les données" }));
			await user.press(screen.getByRole("button", { name: "Exporter les scores en CSV" }));

			expect(exportData).toHaveBeenCalled();
			expect(exportGamesCsv).toHaveBeenCalled();
		});

		it("signale un export qui échoue", async () => {
			const user = userEvent.setup();
			const alert = mockAlert();
			jest.mocked(exportData).mockRejectedValue(new Error("disque plein"));
			await render(<BackupSettingsScreen />);

			await user.press(screen.getByRole("button", { name: "Exporter les données" }));

			expect(alert).toHaveBeenCalledWith("Erreur", "L'export a échoué.");
			expect(screen.getByRole("button", { name: "Exporter les données" })).toBeEnabled();
		});

		it("importe une sauvegarde et résume ce qui a été chargé", async () => {
			const user = userEvent.setup();
			const alert = mockAlert();
			jest.mocked(importData).mockResolvedValue(SUMMARY);
			await render(<BackupSettingsScreen />);

			await user.press(screen.getByRole("button", { name: "Importer une sauvegarde" }));

			expect(alert.mock.calls[0][0]).toBe("Import réussi");
			expect(alert.mock.calls[0][1]).toMatch(/3 joueur\(s\), 1 groupe\(s\) et 12 partie\(s\)/);
		});

		it("explique pourquoi un fichier invalide est refusé", async () => {
			const user = userEvent.setup();
			const alert = mockAlert();
			jest.mocked(importData).mockRejectedValue(new ImportError("Ce fichier n'est pas valide."));
			await render(<BackupSettingsScreen />);

			await user.press(screen.getByRole("button", { name: "Importer une sauvegarde" }));

			expect(alert).toHaveBeenCalledWith("Import annulé", "Ce fichier n'est pas valide.");
		});

		it("annule le dernier import après confirmation", async () => {
			const user = userEvent.setup();
			const alert = mockAlert();
			jest.mocked(restoreSafetyBackup).mockResolvedValue(SUMMARY);
			await render(<BackupSettingsScreen />);

			await user.press(screen.getByRole("button", { name: "Annuler le dernier import" }));
			await pressAlertButton(alert, "Restaurer");

			expect(restoreSafetyBackup).toHaveBeenCalled();
			expect(alertTitles(alert)).toEqual(["Annuler le dernier import ?", "Restauré"]);
		});
	});

	describe("sauvegarde automatique Google Drive", () => {
		it("relie un compte Google dont le Drive est vide", async () => {
			const user = userEvent.setup();
			const alert = mockAlert();
			jest.mocked(connectGoogleDrive).mockResolvedValue({ status: "connected", email: "a@b.c" });
			await render(<BackupSettingsScreen />);

			await user.press(screen.getByRole("button", { name: "Connecter Google Drive" }));

			expect(alert.mock.calls[0][0]).toBe("Sauvegarde automatique activée");
			expect(alert.mock.calls[0][1]).toContain("a@b.c");
		});

		it("demande quelle sauvegarde garder quand le Drive en contient déjà une", async () => {
			const user = userEvent.setup();
			const alert = mockAlert();
			jest
				.mocked(connectGoogleDrive)
				.mockResolvedValue({ status: "conflict", email: "a@b.c", remote });
			await render(<BackupSettingsScreen />);

			await user.press(screen.getByRole("button", { name: "Connecter Google Drive" }));
			expect(alert.mock.calls[0][1]).toContain("1 joueur(s), 0 partie(s)");

			await pressAlertButton(alert, "Google Drive");
			expect(connectWithRemoteBackup).toHaveBeenCalledWith("a@b.c", remote);

			await user.press(screen.getByRole("button", { name: "Connecter Google Drive" }));
			await pressAlertButton(alert, "Ce téléphone");
			expect(connectWithLocalData).toHaveBeenCalledWith("a@b.c");

			await user.press(screen.getByRole("button", { name: "Connecter Google Drive" }));
			await pressAlertButton(alert, "Annuler");
			expect(disconnectGoogleDrive).toHaveBeenCalled();
		});

		it("affiche l'erreur d'une connexion qui échoue", async () => {
			const user = userEvent.setup();
			const alert = mockAlert();
			jest
				.mocked(connectGoogleDrive)
				.mockRejectedValue(new Error("La connexion à Google a échoué."));
			await render(<BackupSettingsScreen />);

			await user.press(screen.getByRole("button", { name: "Connecter Google Drive" }));

			expect(alert).toHaveBeenCalledWith("Erreur", "La connexion à Google a échoué.");
		});

		describe("compte relié", () => {
			beforeEach(() => {
				useBackupStore.getState().connectCloud("a@b.c");
			});

			it("affiche le compte, l'état de l'envoi et la dernière erreur", async () => {
				useBackupStore.getState().setCloudError("Pas de connexion internet.");
				await render(<BackupSettingsScreen />);

				expect(screen.getByText("a@b.c")).toBeOnTheScreen();
				expect(screen.getByText(/Dernier envoi : jamais/)).toBeOnTheScreen();
				expect(screen.getByText("Pas de connexion internet.")).toBeOnTheScreen();
			});

			it("envoie une sauvegarde à la demande, et signale un échec", async () => {
				const user = userEvent.setup();
				const alert = mockAlert();
				jest.mocked(syncCloudBackupNow).mockImplementation(async () => {
					useBackupStore.getState().setCloudError("Google Drive est momentanément indisponible.");
					return false;
				});
				await render(<BackupSettingsScreen />);

				await user.press(screen.getByRole("button", { name: "Sauvegarder maintenant" }));

				expect(syncCloudBackupNow).toHaveBeenCalled();
				expect(alert).toHaveBeenCalledWith(
					"Erreur",
					"Google Drive est momentanément indisponible.",
				);
			});

			it("restaure la sauvegarde Drive après confirmation", async () => {
				const user = userEvent.setup();
				const alert = mockAlert();
				jest.mocked(fetchCloudBackup).mockResolvedValue(remote);
				jest.mocked(restoreFromCloud).mockResolvedValue(SUMMARY);
				await render(<BackupSettingsScreen />);

				await user.press(screen.getByRole("button", { name: "Restaurer depuis Google Drive" }));
				await pressAlertButton(alert, "Restaurer");

				expect(restoreFromCloud).toHaveBeenCalledWith(remote);
				expect(alertTitles(alert)).toEqual(["Restaurer depuis Google Drive ?", "Restauré"]);
			});

			it("prévient quand le Drive ne contient encore aucune sauvegarde", async () => {
				const user = userEvent.setup();
				const alert = mockAlert();
				jest.mocked(fetchCloudBackup).mockResolvedValue(null);
				await render(<BackupSettingsScreen />);

				await user.press(screen.getByRole("button", { name: "Restaurer depuis Google Drive" }));

				expect(alertTitles(alert)).toEqual(["Aucune sauvegarde"]);
				expect(restoreFromCloud).not.toHaveBeenCalled();
			});

			it("désactive la sauvegarde automatique après confirmation", async () => {
				const user = userEvent.setup();
				const alert = mockAlert();
				await render(<BackupSettingsScreen />);

				await user.press(screen.getByRole("button", { name: "Déconnecter" }));
				await pressAlertButton(alert, "Désactiver");

				expect(disconnectGoogleDrive).toHaveBeenCalled();
			});
		});
	});
});
