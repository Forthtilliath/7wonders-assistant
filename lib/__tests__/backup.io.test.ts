import { createEmptyPlayerGameEntry, type Game, type Player } from "@/types/game";

type PickResult = { canceled: true } | { canceled: false; result: { text: () => Promise<string> } };

// Mock auto-suffisant : tout l'état vit dans la closure de la factory (aucune variable externe
// référencée), pour respecter la contrainte de hoisting de jest.mock. Le test pilote ce mock via
// les méthodes statiques `__*` exposées sur la classe, récupérées en castant `File`.
jest.mock("expo-file-system", () => {
	const files = new Map<string, string>();
	let pickResult: PickResult = { canceled: true };

	class MockFile {
		uri: string;
		constructor(dirOrUri: string, name?: string) {
			this.uri = name ?? dirOrUri;
		}
		create() {
			if (!files.has(this.uri)) files.set(this.uri, "");
		}
		write(content: string) {
			files.set(this.uri, content);
		}
		delete() {
			files.delete(this.uri);
		}
		get exists() {
			return files.has(this.uri);
		}
		async text() {
			return files.get(this.uri) ?? "";
		}
		base64Sync() {
			throw new Error("Pas de photo dans ces tests");
		}
		static async pickFileAsync() {
			return pickResult;
		}
		static __setPickResult(result: PickResult) {
			pickResult = result;
		}
		static __getFile(name: string) {
			return files.get(name);
		}
		static __reset() {
			files.clear();
			pickResult = { canceled: true };
		}
	}

	return { File: MockFile, Paths: { cache: "cache", document: "document" } };
});

jest.mock("expo-sharing", () => ({
	isAvailableAsync: jest.fn(async () => true),
	shareAsync: jest.fn(async () => {}),
}));

import { File } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { backup, exportGamesCsv, ImportError } from "@/lib/backup";
import { APP_ID, DATA_VERSION } from "@/lib/backupSchema";
import { useGroupsStore } from "@/stores/groupsStore";
import { useHistoryStore } from "@/stores/historyStore";
import { usePlayersStore } from "@/stores/playersStore";

const MockFile = File as unknown as {
	__setPickResult: (r: PickResult) => void;
	__getFile: (name: string) => string | undefined;
	__reset: () => void;
};
const mockShareAsync = Sharing.shareAsync as jest.Mock;

function makePlayer(id: string, name: string): Player {
	return { id, name, isFavorite: false, isArchived: false, createdAt: 0 };
}

function makeGame(id: string, playerIds: string[]): Game {
	const entries = Object.fromEntries(
		playerIds.map((pid) => [pid, createEmptyPlayerGameEntry(pid)]),
	);
	return { id, createdAt: 0, extensions: [], playerIds, entries };
}

function pickFile(content: string) {
	MockFile.__setPickResult({ canceled: false, result: { text: async () => content } });
}

function backupFile(players: Player[], dataVersion = DATA_VERSION): string {
	return JSON.stringify({
		app: APP_ID,
		dataVersion,
		exportedAt: 0,
		players,
		history: [],
		groups: [],
	});
}

beforeEach(() => {
	MockFile.__reset();
	usePlayersStore.setState({ players: [] });
	useHistoryStore.setState({ games: [] });
	useGroupsStore.setState({ groups: [] });
	jest.clearAllMocks();
});

describe("backup.exportToFile", () => {
	it("écrit un JSON avec joueurs/historique/groupes et ouvre le partage", async () => {
		usePlayersStore.setState({ players: [makePlayer("p1", "Alice")] });
		useHistoryStore.setState({ games: [makeGame("g1", ["p1"])] });

		await backup.exportToFile();

		expect(mockShareAsync).toHaveBeenCalledTimes(1);
		const [uri, options] = mockShareAsync.mock.calls[0];
		expect(uri).toMatch(/^7wonders-save-\d{8}-\d{4}\.json$/);
		expect(options).toMatchObject({ mimeType: "application/json" });

		const data = JSON.parse(MockFile.__getFile(uri) ?? "{}");
		expect(data.players[0].name).toBe("Alice");
		expect(data.history).toHaveLength(1);
	});
});

describe("backup.pickBackupFile", () => {
	it("ne lit rien si l'utilisateur annule la sélection du fichier", async () => {
		await expect(backup.pickBackupFile()).resolves.toEqual({ status: "cancelled" });
	});

	it("rejette un fichier qui n'est pas du JSON valide", async () => {
		pickFile("pas du json");
		await expect(backup.pickBackupFile()).rejects.toThrow(ImportError);
	});

	it("rejette une sauvegarde plus récente que la version supportée par l'app", async () => {
		pickFile(backupFile([], DATA_VERSION + 1));
		await expect(backup.pickBackupFile()).rejects.toThrow(/version plus récente/);
	});

	it("rejette tout le fichier à la première entrée invalide, sans rien appliquer", async () => {
		usePlayersStore.setState({ players: [makePlayer("old", "Ancien")] });
		pickFile(
			backupFile([makePlayer("p1", "Alice"), { ...makePlayer("p2", ""), name: 42 } as never]),
		);

		await expect(backup.pickBackupFile()).rejects.toThrow(ImportError);
		expect(usePlayersStore.getState().players.map((p) => p.name)).toEqual(["Ancien"]);
	});

	it("lit une sauvegarde valide sans l'appliquer avant confirmation", async () => {
		usePlayersStore.setState({ players: [makePlayer("old", "Ancien")] });
		pickFile(backupFile([makePlayer("p1", "Alice")]));

		const result = await backup.pickBackupFile();

		expect(result.status).toBe("ready");
		expect(usePlayersStore.getState().players.map((p) => p.name)).toEqual(["Ancien"]);
	});
});

describe("backup.restore", () => {
	it("remplace les données, et la restauration peut être annulée", async () => {
		usePlayersStore.setState({ players: [makePlayer("old", "Ancien")] });
		pickFile(backupFile([makePlayer("p1", "Alice")]));
		const picked = await backup.pickBackupFile();
		if (picked.status !== "ready") throw new Error("Sauvegarde non lue");

		await backup.restore(picked.data);
		expect(usePlayersStore.getState().players.map((p) => p.name)).toEqual(["Alice"]);

		await backup.undoLastRestore();
		expect(usePlayersStore.getState().players.map((p) => p.name)).toEqual(["Ancien"]);
	});
});

describe("exportGamesCsv", () => {
	it("écrit un CSV et ouvre le partage avec le bon type MIME", async () => {
		usePlayersStore.setState({ players: [makePlayer("p1", "Alice")] });
		useHistoryStore.setState({ games: [makeGame("g1", ["p1"])] });

		await exportGamesCsv();

		expect(mockShareAsync).toHaveBeenCalledTimes(1);
		const [uri, options] = mockShareAsync.mock.calls[0];
		expect(options).toMatchObject({ mimeType: "text/csv" });
		expect(MockFile.__getFile(uri)).toContain("Alice");
	});
});
