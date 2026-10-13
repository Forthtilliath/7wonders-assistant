import type { Player } from "@/types/game";

// Système de fichiers en mémoire : URI → contenu base64. Mock auto-suffisant (hoisting de jest.mock).
jest.mock("expo-file-system", () => {
	const files = new Map<string, string>();

	class MockFile {
		uri: string;
		constructor(parentOrUri: string | { uri: string }, name?: string) {
			this.uri = typeof parentOrUri === "string" ? parentOrUri : `${parentOrUri.uri}${name}`;
		}
		get exists() {
			return files.has(this.uri);
		}
		create() {
			files.set(this.uri, "");
		}
		write(content: string) {
			files.set(this.uri, content);
		}
		base64Sync() {
			const content = files.get(this.uri);
			if (content === undefined) throw new Error("Fichier introuvable");
			return content;
		}
		delete() {
			files.delete(this.uri);
		}
		static __files = files;
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
		list() {
			return [...files.keys()]
				.filter((uri) => uri.startsWith(this.uri))
				.map((uri) => new MockFile(uri));
		}
	}

	return { File: MockFile, Directory: MockDirectory, Paths: { document: "file:///documents/" } };
});

jest.mock("expo-image-manipulator", () => {
	const context: { resize: jest.Mock; renderAsync: jest.Mock } = {
		resize: jest.fn(() => context),
		renderAsync: jest.fn(async () => ({ saveAsync: async () => ({ base64: "VIGNETTE" }) })),
	};
	return { SaveFormat: { JPEG: "jpeg" }, ImageManipulator: { manipulate: jest.fn(() => context) } };
});

import { File } from "expo-file-system";
import { ImageManipulator } from "expo-image-manipulator";
import {
	collectAvatars,
	persistLegacyAvatars,
	pruneUnusedAvatars,
	restoreAvatars,
	storeAvatar,
} from "@/lib/avatarFiles";

const files = (File as unknown as { __files: Map<string, string> }).__files;
const AVATARS = "file:///documents/avatars/";
const CACHE_URI = "file:///cache/ImagePicker/photo.jpg";

function makePlayer(id: string, avatarUri?: string): Player {
	return { id, name: id, avatarUri, isFavorite: false, isArchived: false, createdAt: 0 };
}

beforeEach(() => {
	files.clear();
	jest.clearAllMocks();
});

describe("storeAvatar", () => {
	it("réduit la photo et la range dans le dossier persistant des avatars", async () => {
		files.set(CACHE_URI, "ORIGINAL");

		const uri = await storeAvatar(CACHE_URI);

		expect(ImageManipulator.manipulate).toHaveBeenCalledWith(CACHE_URI);
		expect(ImageManipulator.manipulate(CACHE_URI).resize).toHaveBeenCalledWith({ width: 256 });
		expect(uri.startsWith(AVATARS)).toBe(true);
		expect(files.get(uri)).toBe("VIGNETTE");
	});
});

describe("collectAvatars", () => {
	it("embarque les photos lisibles et ignore les joueurs sans photo ou au fichier disparu", () => {
		files.set(`${AVATARS}a.jpg`, "PHOTO_A");

		const avatars = collectAvatars([
			makePlayer("p1", `${AVATARS}a.jpg`),
			makePlayer("p2"),
			makePlayer("p3", `${AVATARS}disparue.jpg`),
		]);

		expect(avatars).toEqual({ p1: "PHOTO_A" });
	});
});

describe("restoreAvatars", () => {
	it("recrée les photos de la sauvegarde et y fait pointer les joueurs", () => {
		const [player] = restoreAvatars([makePlayer("p1", "file:///autre-telephone/a.jpg")], {
			p1: "PHOTO_A",
		});

		expect(player.avatarUri?.startsWith(AVATARS)).toBe(true);
		expect(files.get(player.avatarUri ?? "")).toBe("PHOTO_A");
	});

	it("garde une photo encore présente et retire celle qui n'existe pas sur l'appareil", () => {
		files.set(`${AVATARS}a.jpg`, "PHOTO_A");

		const players = restoreAvatars([
			makePlayer("p1", `${AVATARS}a.jpg`),
			makePlayer("p2", "file:///autre-telephone/b.jpg"),
		]);

		expect(players.map((p) => p.avatarUri)).toEqual([`${AVATARS}a.jpg`, undefined]);
	});
});

describe("persistLegacyAvatars", () => {
	it("range les photos restées dans le cache et oublie celles déjà effacées", async () => {
		files.set(`${AVATARS}a.jpg`, "PHOTO_A");
		files.set(CACHE_URI, "ORIGINAL");

		const updates = await persistLegacyAvatars([
			makePlayer("p1", `${AVATARS}a.jpg`),
			makePlayer("p2", CACHE_URI),
			makePlayer("p3", "file:///cache/ImagePicker/effacee.jpg"),
			makePlayer("p4"),
		]);

		expect(updates).toEqual([
			{ id: "p2", avatarUri: expect.stringMatching(/^file:\/\/\/documents\/avatars\//) },
			{ id: "p3", avatarUri: undefined },
		]);
	});
});

describe("pruneUnusedAvatars", () => {
	it("supprime seulement les photos qu'aucun joueur n'utilise", () => {
		files.set(`${AVATARS}a.jpg`, "PHOTO_A");
		files.set(`${AVATARS}orpheline.jpg`, "VIEILLE");

		pruneUnusedAvatars([makePlayer("p1", `${AVATARS}a.jpg`)]);

		expect([...files.keys()]).toEqual([`${AVATARS}a.jpg`]);
	});
});
