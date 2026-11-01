import AsyncStorage from "@react-native-async-storage/async-storage";

// Système de fichiers en mémoire : URI → contenu. Mock auto-suffisant (hoisting de jest.mock).
jest.mock("expo-file-system", () => {
	const files = new Map<string, string>();
	const state = { failWrites: false };

	class MockFile {
		uri: string;
		constructor(parentOrUri: string | { uri: string }, name?: string) {
			this.uri = typeof parentOrUri === "string" ? parentOrUri : `${parentOrUri.uri}${name}`;
		}
		get exists() {
			return files.has(this.uri);
		}
		create() {
			if (state.failWrites) throw new Error("Écriture impossible");
			files.set(this.uri, "");
		}
		write(content: string) {
			files.set(this.uri, content);
		}
		textSync() {
			const content = files.get(this.uri);
			if (content === undefined) throw new Error("Fichier introuvable");
			return content;
		}
		static __files = files;
		static __state = state;
	}

	class MockDirectory {
		uri: string;
		constructor(parent: string, name: string) {
			this.uri = `${parent}${name}/`;
		}
		get exists() {
			return true;
		}
		create() {}
	}

	return { File: MockFile, Directory: MockDirectory, Paths: { document: "file:///documents/" } };
});

import { File } from "expo-file-system";
import { createStoreMigrate, runMigrationSteps } from "@/lib/persistedState";
import { rescueStorageKey } from "@/lib/rescueCopies";
import { useDataIssuesStore } from "@/stores/dataIssuesStore";

const mock = File as unknown as { __files: Map<string, string>; __state: { failWrites: boolean } };
const COPY_URI = "file:///documents/secours/test-store-v1-avant-migration.json";
const readCopy = (uri: string) => JSON.parse(mock.__files.get(uri) ?? "null");
const issues = () => useDataIssuesStore.getState().issues;

/** Les écritures de secours dans AsyncStorage ne sont pas attendues : on les laisse finir. */
const flushStorage = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(async () => {
	await AsyncStorage.clear();
	mock.__files.clear();
	mock.__state.failWrites = false;
	useDataIssuesStore.getState().clear();
});

describe("runMigrationSteps", () => {
	const steps = {
		1: (s: unknown) => [...(s as number[]), 2],
		2: (s: unknown) => [...(s as number[]), 3],
	};

	it("applique chaque étape dans l'ordre, depuis n'importe quelle version", () => {
		expect(runMigrationSteps([1], 1, 3, steps)).toEqual([1, 2, 3]);
		expect(runMigrationSteps([1, 2], 2, 3, steps)).toEqual([1, 2, 3]);
	});

	it("échoue s'il manque une étape ou si la version est plus récente", () => {
		expect(() => runMigrationSteps([], 0, 3, steps)).toThrow("version 0 à 1");
		expect(() => runMigrationSteps([], 4, 3, steps)).toThrow("plus récente");
	});
});

describe("createStoreMigrate", () => {
	const migrate = createStoreMigrate(
		"test-store",
		2,
		{ 1: (s) => ({ ...(s as object), b: 2 }) },
		{ empty: true },
	);

	it("garde l'état à la version courante, sans copie", () => {
		const state = { a: 1 };
		expect(migrate(state, 2)).toBe(state);
		expect(mock.__files.size).toBe(0);
	});

	it("garde une copie de l'état d'origine avant de le convertir", () => {
		expect(migrate({ a: 1 }, 1)).toEqual({ a: 1, b: 2 });
		expect(readCopy(COPY_URI)).toMatchObject({ store: "test-store", version: 1, state: { a: 1 } });
		expect(issues()).toEqual([]);
	});

	it("n'écrase jamais une copie déjà gardée", () => {
		migrate({ a: "premier" }, 1);
		migrate({ a: "second" }, 1);
		expect(readCopy(COPY_URI).state).toEqual({ a: "premier" });
	});

	it("démarre vide sans conversion possible, en gardant la copie et en prévenant", () => {
		expect(migrate({ a: 1 }, 0)).toEqual({ empty: true });
		const uri = "file:///documents/secours/test-store-v0-avant-migration.json";
		expect(readCopy(uri).state).toEqual({ a: 1 });
		expect(issues()).toEqual([{ storeName: "test-store", kind: "migration", copyUri: uri }]);
	});

	it("signale des données d'une version plus récente de l'app", () => {
		expect(migrate({ a: 1 }, 3)).toEqual({ empty: true });
		expect(issues()[0].kind).toBe("newer");
	});

	it("traite une étape qui échoue comme une conversion impossible", () => {
		const failing = createStoreMigrate(
			"test-store",
			2,
			{
				1: () => {
					throw new Error("forme inattendue");
				},
			},
			{},
		);
		expect(failing({ a: 1 }, 1)).toEqual({});
		expect(issues()[0].kind).toBe("migration");
	});

	it("garde la copie dans AsyncStorage si le fichier ne peut pas être écrit", async () => {
		mock.__state.failWrites = true;
		migrate({ a: 1 }, 0);
		await flushStorage();
		const kept = JSON.parse((await AsyncStorage.getItem(rescueStorageKey("test-store"))) ?? "");
		expect(kept.state).toEqual({ a: 1 });
		expect(issues()).toEqual([{ storeName: "test-store", kind: "migration", copyUri: null }]);
	});

	it("revient à la valeur par défaut d'un réglage de l'appareil, sans copie ni alerte", () => {
		const settings = createStoreMigrate("reglage", 2, {}, { mode: "dark" }, { report: false });
		expect(settings({ mode: "obsolète" }, 1)).toEqual({ mode: "dark" });
		expect(mock.__files.size).toBe(0);
		expect(issues()).toEqual([]);
	});
});
