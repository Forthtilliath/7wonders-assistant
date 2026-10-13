import { OFFICIAL_WONDERS } from "@/constants/wonders";
import type { CustomWonder, Game } from "@/types/game";
import { createEmptyPlayerGameEntry } from "@/types/game";
import {
	getAvailableWonders,
	getCustomWonderNameError,
	getWonderNameSuggestions,
	normalizeWonderName,
	type WonderOption,
} from "../wonders";

function makeGame(id: string, wonderNames: string[]): Game {
	const playerIds = wonderNames.map((_, i) => `p${i}`);
	const entries = Object.fromEntries(
		wonderNames.map((name, i) => [
			`p${i}`,
			{ ...createEmptyPlayerGameEntry(`p${i}`), wonder: { name, side: "A" as const } },
		]),
	);
	return { id, createdAt: 0, extensions: [], playerIds, entries };
}

const custom = (name: string): CustomWonder => ({ id: name, name, createdAt: 0 });
const names = (options: WonderOption[]) => options.map((o) => o.name);

describe("catalogue des merveilles officielles", () => {
	it("a des identifiants et des noms uniques", () => {
		const ids = OFFICIAL_WONDERS.map((w) => w.id);
		const keys = OFFICIAL_WONDERS.map((w) => normalizeWonderName(w.name));
		expect(new Set(ids).size).toBe(ids.length);
		expect(new Set(keys).size).toBe(keys.length);
	});
});

describe("getAvailableWonders", () => {
	it("propose les 7 merveilles du jeu de base, sans celles des extensions inactives", () => {
		const available = getAvailableWonders("second", [], [], []);
		expect(names(available)).toEqual([
			"Alexandrie",
			"Babylone",
			"Éphèse",
			"Gizeh",
			"Halicarnasse",
			"Olympie",
			"Rhodes",
		]);
		expect(available.every((w) => w.source === "base")).toBe(true);
	});

	it("ajoute les merveilles des extensions actives", () => {
		const available = names(getAvailableWonders("second", ["leaders", "cities", "armada"], [], []));
		expect(available).toEqual(expect.arrayContaining(["Rome", "Byzance", "Pétra", "Syracuse"]));
	});

	it("propose le Wonder Pack en 1re édition seulement", () => {
		expect(names(getAvailableWonders("first", [], [], []))).toContain("Stonehenge");
		expect(names(getAvailableWonders("second", [], [], []))).not.toContain("Stonehenge");
	});

	it("termine par les merveilles perso, triées, sans doublon d'une officielle", () => {
		const available = getAvailableWonders(
			"second",
			[],
			[custom("Ys"), custom("Atlantide"), custom("rhodes")],
			[],
		);
		expect(available.slice(-2)).toEqual([
			{ name: "Atlantide", source: "custom" },
			{ name: "Ys", source: "custom" },
		]);
		expect(names(available).filter((n) => normalizeWonderName(n) === "rhodes")).toEqual(["Rhodes"]);
	});

	it("ne propose que les merveilles des extensions non officielles cochées pour la partie", () => {
		const wonders = [
			{ ...custom("Atlantide"), packId: "box" },
			{ ...custom("Ys"), packId: "drafts" },
			custom("Lémurie"),
		];
		const available = names(getAvailableWonders("second", [], wonders, ["box"]));
		expect(available).toEqual(expect.arrayContaining(["Atlantide", "Lémurie"]));
		expect(available).not.toContain("Ys");
	});
});

describe("getWonderNameSuggestions", () => {
	const options = getAvailableWonders("second", [], [], []);

	it("ne propose rien tant que rien n'est tapé", () => {
		expect(getWonderNameSuggestions({ options, games: [], query: "  " })).toEqual([]);
	});

	it("écarte les merveilles déjà prises par les autres joueurs", () => {
		const suggestions = getWonderNameSuggestions({
			options,
			games: [],
			query: "e",
			takenNames: ["rhodes", "Éphèse", ""],
		});
		expect(suggestions).not.toContain("Rhodes");
		expect(suggestions).not.toContain("Éphèse");
		expect(suggestions).toEqual(expect.arrayContaining(["Alexandrie", "Babylone", "Gizeh"]));
	});

	it("filtre sans tenir compte de la casse ni des accents", () => {
		expect(getWonderNameSuggestions({ options, games: [], query: "EPH" })).toEqual(["Éphèse"]);
	});

	it("met d'abord les noms qui commencent par la saisie, puis les jouables avant l'historique", () => {
		const games = [makeGame("g1", ["Babel perso", "babylone"]), makeGame("g2", ["Abydos"])];
		expect(getWonderNameSuggestions({ options, games, query: "ab" })).toEqual([
			"Abydos",
			"Babylone",
			"Babel perso",
		]);
	});

	it("ne suggère pas depuis l'historique une merveille connue mais non jouable dans la partie", () => {
		const games = [makeGame("g1", ["Stonehenge", "Atlantide", "Stonehenge bis"])];
		const knownNames = ["Stonehenge", "Atlantide"];
		expect(getWonderNameSuggestions({ options, games, query: "st", knownNames })).toEqual([
			"Stonehenge bis",
		]);
		expect(getWonderNameSuggestions({ options, games, query: "atl", knownNames })).toEqual([]);
	});

	it("n'inclut pas le nom déjà tapé exactement, ni les entrées vides de l'historique", () => {
		const games = [makeGame("g1", ["", "Gizah"])];
		expect(getWonderNameSuggestions({ options, games, query: "gizeh" })).toEqual([]);
		expect(getWonderNameSuggestions({ options, games, query: "giz" })).toEqual(["Gizeh", "Gizah"]);
	});

	it("limite à 5 suggestions par défaut", () => {
		const games = [makeGame("g1", ["A1", "A2", "A3", "A4", "A5", "A6"])];
		expect(getWonderNameSuggestions({ options, games, query: "a" })).toHaveLength(5);
	});

	it("accepte une autre limite", () => {
		const games = [makeGame("g1", ["A1", "A2", "A3", "A4", "A5", "A6"])];
		expect(getWonderNameSuggestions({ options, games, query: "a", limit: 3 })).toHaveLength(3);
	});
});

describe("getCustomWonderNameError", () => {
	it("accepte un nom nouveau", () => {
		expect(getCustomWonderNameError("  Atlantide ", [])).toBeNull();
	});

	it("refuse un nom vide ou trop long", () => {
		expect(getCustomWonderNameError("   ", [])).not.toBeNull();
		expect(getCustomWonderNameError("A".repeat(101), [])).not.toBeNull();
	});

	it("refuse un nom déjà officiel (toutes éditions) ou déjà perso", () => {
		expect(getCustomWonderNameError("ephese", [])).toBe("Cette merveille existe déjà.");
		expect(getCustomWonderNameError("Stonehenge", [])).toBe("Cette merveille existe déjà.");
		expect(getCustomWonderNameError("ATLANTIDE", [custom("Atlantide")])).toBe(
			"Cette merveille existe déjà.",
		);
	});
});
