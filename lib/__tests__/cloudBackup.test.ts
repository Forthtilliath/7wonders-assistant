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

import { APP_ID, type BackupData, DATA_VERSION } from "@/lib/backupSchema";
import { connectGoogleDrive, connectWithRemoteBackup, syncCloudBackupNow } from "@/lib/cloudBackup";
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
