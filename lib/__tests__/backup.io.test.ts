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
		constructor(_dir: unknown, name: string) {
			this.uri = name;
		}
		create() {
			if (!files.has(this.uri)) files.set(this.uri, "");
		}
		write(content: string) {
			files.set(this.uri, content);
		}
		get exists() {
			return files.has(this.uri);
		}
		async text() {
			return files.get(this.uri) ?? "";
		}
		static async pickFileAsync() {
			return pickResult;
		}
		static __setPickResult(result: PickResult) {
			pickResult = result;
		}
		static __writeFile(name: string, content: string) {
			files.set(name, content);
		}
		static __getFile(name: string) {
			return files.get(name);
		}
		static __reset() {
			files.clear();
			pickResult = { canceled: true };
		}
	}

	return { File: MockFile, Paths: { cache: "cache" } };
});

jest.mock("expo-sharing", () => ({
	isAvailableAsync: jest.fn(async () => true),
	shareAsync: jest.fn(async () => {}),
}));

import { File } from "expo-file-system";
import * as Sharing from "expo-sharing";
import {
	exportData,
	exportGamesCsv,
	ImportError,
	importData,
	restoreSafetyBackup,
} from "@/lib/backup";
import { DATA_VERSION } from "@/lib/backupSchema";
import { useGroupsStore } from "@/stores/groupsStore";
import { useHistoryStore } from "@/stores/historyStore";
import { usePlayersStore } from "@/stores/playersStore";

const MockFile = File as unknown as {
	__setPickResult: (r: PickResult) => void;
	__writeFile: (name: string, content: string) => void;
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

beforeEach(() => {
	MockFile.__reset();
	usePlayersStore.setState({ players: [] });
	useHistoryStore.setState({ games: [] });
	useGroupsStore.setState({ groups: [] });
	jest.clearAllMocks();
});

describe("exportData", () => {
	it("écrit un JSON avec joueurs/historique/groupes et ouvre le partage", async () => {
		usePlayersStore.setState({ players: [makePlayer("p1", "Alice")] });
		useHistoryStore.setState({ games: [makeGame("g1", ["p1"])] });

		await exportData();

		expect(mockShareAsync).toHaveBeenCalledTimes(1);
		const [uri, options] = mockShareAsync.mock.calls[0];
		expect(options).toMatchObject({ mimeType: "application/json" });

		const data = JSON.parse(MockFile.__getFile(uri) ?? "{}");
		expect(data.players).toHaveLength(1);
		expect(data.players[0].name).toBe("Alice");
		expect(data.history).toHaveLength(1);
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

describe("importData", () => {
	it("rejette si l'utilisateur annule la sélection du fichier", async () => {
		MockFile.__setPickResult({ canceled: true });
		await expect(importData()).rejects.toThrow(ImportError);
	});

	it("rejette un fichier qui n'est pas du JSON valide", async () => {
		MockFile.__setPickResult({ canceled: false, result: { text: async () => "pas du json" } });
		await expect(importData()).rejects.toThrow(ImportError);
	});

	it("rejette une sauvegarde plus récente que la version supportée par l'app", async () => {
		const backup = {
			app: "7wonders-assistant",
			dataVersion: DATA_VERSION + 1,
			exportedAt: 0,
			players: [],
			history: [],
			groups: [],
		};
		MockFile.__setPickResult({
			canceled: false,
			result: { text: async () => JSON.stringify(backup) },
		});

		await expect(importData()).rejects.toThrow(ImportError);
	});

	it("importe une sauvegarde valide et écrit une sauvegarde de secours de l'état précédent", async () => {
		usePlayersStore.setState({ players: [makePlayer("old", "Ancien")] });

		const backup = {
			app: "7wonders-assistant",
			dataVersion: DATA_VERSION,
			exportedAt: 0,
			players: [makePlayer("p1", "Alice")],
			history: [],
			groups: [],
		};
		MockFile.__setPickResult({
			canceled: false,
			result: { text: async () => JSON.stringify(backup) },
		});

		const result = await importData();

		expect(result).toEqual({ players: 1, history: 0, groups: 0 });
		expect(usePlayersStore.getState().players.map((p) => p.name)).toEqual(["Alice"]);

		const safety = MockFile.__getFile("before-import-safety-backup.json");
		expect(JSON.parse(safety ?? "{}").players[0].name).toBe("Ancien");
	});
});

describe("restoreSafetyBackup", () => {
	it("rejette s'il n'y a aucune sauvegarde de secours disponible", async () => {
		await expect(restoreSafetyBackup()).rejects.toThrow(ImportError);
	});

	it("restaure les données de la sauvegarde de secours", async () => {
		const backup = {
			app: "7wonders-assistant",
			dataVersion: DATA_VERSION,
			exportedAt: 0,
			players: [makePlayer("p1", "Alice")],
			history: [],
			groups: [],
		};
		MockFile.__writeFile("before-import-safety-backup.json", JSON.stringify(backup));

		const result = await restoreSafetyBackup();

		expect(result).toEqual({ players: 1, history: 0, groups: 0 });
		expect(usePlayersStore.getState().players.map((p) => p.name)).toEqual(["Alice"]);
	});
});
