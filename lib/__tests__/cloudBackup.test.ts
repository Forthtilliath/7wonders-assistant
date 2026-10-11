jest.mock("expo-file-system", () => {
	class MockFile {
		create() {}
		write() {}
	}
	return { File: MockFile, Paths: { cache: "cache" } };
});
jest.mock("expo-sharing", () => ({}));
jest.mock("@/lib/googleAuth", () => ({
	GoogleAuthError: class GoogleAuthError extends Error {},
	signInToGoogle: jest.fn(),
	getDriveAccessToken: jest.fn(async () => "jeton"),
	invalidateDriveAccessToken: jest.fn(async () => {}),
	signOutFromGoogle: jest.fn(async () => {}),
}));
jest.mock("@/lib/googleDrive", () => ({
	...jest.requireActual("@/lib/googleDrive"),
	findBackupFile: jest.fn(),
	downloadBackupFile: jest.fn(),
	uploadBackupFile: jest.fn(),
}));

import { APP_ID, type BackupData, DATA_VERSION, ImportError } from "@/lib/backupSchema";
import {
	cloudErrorMessage,
	connectGoogleDrive,
	connectWithLocalData,
	connectWithRemoteBackup,
	disconnectGoogleDrive,
	restoreFromCloud,
	syncCloudBackupNow,
} from "@/lib/cloudBackup";
import * as googleAuth from "@/lib/googleAuth";
import * as googleDrive from "@/lib/googleDrive";
import { initialBackupState, useBackupStore } from "@/stores/backupStore";
import { useGroupsStore } from "@/stores/groupsStore";
import { useHistoryStore } from "@/stores/historyStore";
import { usePlayersStore } from "@/stores/playersStore";
import type { Player } from "@/types/game";

const signIn = googleAuth.signInToGoogle as jest.Mock;
const findFile = googleDrive.findBackupFile as jest.Mock;
const download = googleDrive.downloadBackupFile as jest.Mock;
const upload = googleDrive.uploadBackupFile as jest.Mock;

function makePlayer(id: string, name: string): Player {
	return { id, name, isFavorite: false, isArchived: false, createdAt: 0 };
}

function remoteBackup(players: Player[]): BackupData {
	return {
		app: APP_ID,
		dataVersion: DATA_VERSION,
		exportedAt: 1000,
		players,
		history: [],
		groups: [],
	};
}

beforeEach(() => {
	jest.clearAllMocks();
	useBackupStore.setState(initialBackupState);
	usePlayersStore.setState({ players: [makePlayer("local", "Local")] });
	useHistoryStore.setState({ games: [] });
	useGroupsStore.setState({ groups: [] });
	upload.mockResolvedValue({ id: "f1", modifiedTime: "t" });
});

describe("connectGoogleDrive", () => {
	it("ne relie rien si l'utilisateur annule la connexion", async () => {
		signIn.mockResolvedValue(null);
		await expect(connectGoogleDrive()).resolves.toEqual({ status: "cancelled" });
		expect(useBackupStore.getState().cloudAccount).toBeNull();
	});

	it("relie le compte et envoie tout de suite quand Drive est vide", async () => {
		signIn.mockResolvedValue("a@b.c");
		findFile.mockResolvedValue(null);

		await expect(connectGoogleDrive()).resolves.toEqual({ status: "connected", email: "a@b.c" });

		expect(upload).toHaveBeenCalledWith("jeton", expect.stringContaining("Local"), null);
		expect(useBackupStore.getState()).toMatchObject({
			cloudAccount: { email: "a@b.c" },
			cloudSyncPending: false,
		});
		expect(useBackupStore.getState().lastCloudBackupAt).not.toBeNull();
	});

	it("n'écrase pas une sauvegarde Drive existante sans demander", async () => {
		signIn.mockResolvedValue("a@b.c");
		findFile.mockResolvedValue({ id: "f1", modifiedTime: "t" });
		download.mockResolvedValue(JSON.stringify(remoteBackup([makePlayer("r", "Distant")])));

		const result = await connectGoogleDrive();

		expect(result.status).toBe("conflict");
		expect(upload).not.toHaveBeenCalled();
		expect(useBackupStore.getState().cloudAccount).toBeNull();
	});
});

describe("connectWithRemoteBackup", () => {
	it("restaure les données Drive puis relie le compte sans renvoyer", async () => {
		await connectWithRemoteBackup("a@b.c", remoteBackup([makePlayer("r", "Distant")]));

		expect(usePlayersStore.getState().players.map((p) => p.name)).toEqual(["Distant"]);
		expect(useBackupStore.getState()).toMatchObject({
			cloudAccount: { email: "a@b.c" },
			lastCloudBackupAt: 1000,
			cloudSyncPending: false,
		});
		expect(upload).not.toHaveBeenCalled();
	});
});

describe("syncCloudBackupNow", () => {
	it("ne fait rien sans compte relié", async () => {
		await expect(syncCloudBackupNow()).resolves.toBe(false);
		expect(findFile).not.toHaveBeenCalled();
	});

	it("met à jour le fichier existant", async () => {
		useBackupStore.getState().connectCloud("a@b.c");
		findFile.mockResolvedValue({ id: "f1", modifiedTime: "t" });

		await expect(syncCloudBackupNow()).resolves.toBe(true);
		expect(upload).toHaveBeenCalledWith("jeton", expect.any(String), "f1");
	});

	it("réessaie une fois avec un jeton neuf quand Drive refuse le jeton", async () => {
		useBackupStore.getState().connectCloud("a@b.c");
		findFile
			.mockRejectedValueOnce(new googleDrive.DriveError("expiré", 401))
			.mockResolvedValue(null);

		await expect(syncCloudBackupNow()).resolves.toBe(true);
		expect(googleAuth.invalidateDriveAccessToken).toHaveBeenCalledWith("jeton");
		expect(upload).toHaveBeenCalledTimes(1);
	});

	it("mémorise l'erreur et garde l'envoi en attente en cas d'échec", async () => {
		useBackupStore.getState().connectCloud("a@b.c");
		useBackupStore.getState().markCloudPending();
		findFile.mockRejectedValue(new TypeError("Network request failed"));

		await expect(syncCloudBackupNow()).resolves.toBe(false);
		expect(useBackupStore.getState()).toMatchObject({
			cloudSyncPending: true,
			cloudError: "Pas de connexion internet.",
		});
	});
});

describe("cloudErrorMessage", () => {
	it.each([
		[
			new googleAuth.GoogleAuthError("Reconnecte ton compte Google."),
			"Reconnecte ton compte Google.",
		],
		[new ImportError("Sauvegarde invalide."), "Sauvegarde invalide."],
		[
			new googleDrive.DriveError("refusé", 403),
			"Google Drive a refusé l'accès. Reconnecte ton compte Google.",
		],
		[new googleDrive.DriveError("panne", 503), "Google Drive est momentanément indisponible."],
		[new TypeError("Network request failed"), "Pas de connexion internet."],
		[new Error("autre"), "La sauvegarde sur Google Drive a échoué."],
	])("traduit %p en message affichable", (error, message) => {
		expect(cloudErrorMessage(error)).toBe(message);
	});
});

describe("connectGoogleDrive (cas limites)", () => {
	it("relie directement le compte si la sauvegarde Drive est vide", async () => {
		signIn.mockResolvedValue("a@b.c");
		findFile.mockResolvedValue({ id: "f1", modifiedTime: "t" });
		download.mockResolvedValue(JSON.stringify(remoteBackup([])));

		await expect(connectGoogleDrive()).resolves.toEqual({ status: "connected", email: "a@b.c" });
		expect(upload).toHaveBeenCalledWith("jeton", expect.any(String), "f1");
	});

	it("referme la session Google si la lecture du Drive échoue", async () => {
		signIn.mockResolvedValue("a@b.c");
		findFile.mockRejectedValue(new googleDrive.DriveError("panne", 503));

		await expect(connectGoogleDrive()).rejects.toThrow("panne");
		expect(googleAuth.signOutFromGoogle).toHaveBeenCalled();
		expect(useBackupStore.getState().cloudAccount).toBeNull();
	});
});

describe("connectWithLocalData", () => {
	it("relie le compte et remplace la sauvegarde Drive par les données du téléphone", async () => {
		findFile.mockResolvedValue({ id: "f1", modifiedTime: "t" });

		await connectWithLocalData("a@b.c");

		expect(useBackupStore.getState().cloudAccount).toEqual({ email: "a@b.c" });
		expect(upload).toHaveBeenCalledWith("jeton", expect.stringContaining("Local"), "f1");
	});
});

describe("restoreFromCloud", () => {
	it("remplace les données locales par la sauvegarde Drive", async () => {
		useBackupStore.getState().connectCloud("a@b.c");

		const summary = await restoreFromCloud(remoteBackup([makePlayer("r", "Distant")]));

		expect(summary).toEqual({ players: 1, history: 0, groups: 0 });
		expect(usePlayersStore.getState().players.map((p) => p.name)).toEqual(["Distant"]);
		expect(useBackupStore.getState().lastCloudBackupAt).toBe(1000);
	});
});

describe("disconnectGoogleDrive", () => {
	it("révoque l'accès Google et oublie le compte", async () => {
		useBackupStore.getState().connectCloud("a@b.c");
		useBackupStore.getState().markCloudPending();

		await disconnectGoogleDrive();

		expect(googleAuth.signOutFromGoogle).toHaveBeenCalled();
		expect(useBackupStore.getState()).toMatchObject({
			cloudAccount: null,
			cloudSyncPending: false,
		});
	});
});

describe("syncCloudBackupNow (envois concurrents)", () => {
	it("refait un envoi à la fin quand des données changent pendant l'envoi en cours", async () => {
		useBackupStore.getState().connectCloud("a@b.c");
		let finishFirstUpload: () => void = () => {};
		findFile.mockResolvedValue(null);
		upload
			.mockImplementationOnce(
				() =>
					new Promise((resolve) => {
						finishFirstUpload = () => resolve({ id: "f1", modifiedTime: "t" });
					}),
			)
			.mockResolvedValue({ id: "f1", modifiedTime: "t" });

		const first = syncCloudBackupNow();
		await new Promise(process.nextTick);
		// Un second envoi demandé pendant le premier n'est pas lancé en parallèle…
		await expect(syncCloudBackupNow()).resolves.toBe(false);
		expect(upload).toHaveBeenCalledTimes(1);

		finishFirstUpload();
		await expect(first).resolves.toBe(true);
		await new Promise(process.nextTick);
		// … mais relancé dès la fin du premier.
		expect(upload).toHaveBeenCalledTimes(2);
	});
});
