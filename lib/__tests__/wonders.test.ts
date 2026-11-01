import { OFFICIAL_WONDERS } from "@/constants/wonders";
import type { CustomWonder, Game } from "@/types/game";
import { createEmptyPlayerGameEntry } from "@/types/game";
import {
	getAvailableWonders,
	getCustomWonderNameError,
	getWonderNameSuggestions,
	normalizeWonderName,
	renameWonderInGames,
	toCanonicalWonderName,
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
			"Alexandria",
			"Babylon",
			"Ephesos",
			"Gizah",
			"Halikarnassos",
			"Olympía",
			"Rhódos",
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
			[custom("Ys"), custom("Atlantide"), custom("rhodos")],
			[],
		);
		expect(available.slice(-2)).toEqual([
			{ name: "Atlantide", source: "custom" },
			{ name: "Ys", source: "custom" },
		]);
		expect(names(available).filter((n) => normalizeWonderName(n) === "rhodos")).toEqual(["Rhódos"]);
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
			query: "a",
			takenNames: ["rhodos", "Gizah", ""],
		});
		expect(suggestions).not.toContain("Rhódos");
		expect(suggestions).not.toContain("Gizah");
		expect(suggestions).toEqual(expect.arrayContaining(["Alexandria", "Babylon", "Olympía"]));
	});

	it("filtre sans tenir compte de la casse ni des accents", () => {
		expect(getWonderNameSuggestions({ options, games: [], query: "OLYMPIA" })).toEqual(["Olympía"]);
		expect(getWonderNameSuggestions({ options, games: [], query: "rhód" })).toEqual(["Rhódos"]);
	});

	it("met d'abord les noms qui commencent par la saisie, puis les jouables avant l'historique", () => {
		const games = [makeGame("g1", ["Babel perso", "babylon"]), makeGame("g2", ["Abydos"])];
		expect(getWonderNameSuggestions({ options, games, query: "ab" })).toEqual([
			"Abydos",
			"Babylon",
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
		const games = [makeGame("g1", ["", "Gizeh perso"])];
		expect(getWonderNameSuggestions({ options, games, query: "Gizah" })).toEqual([]);
		expect(getWonderNameSuggestions({ options, games, query: "giz" })).toEqual([
			"Gizah",
			"Gizeh perso",
		]);
	});

	it("propose l'écriture exacte d'un nom tapé sans ses accents", () => {
		expect(getWonderNameSuggestions({ options, games: [], query: "rhodos" })).toEqual(["Rhódos"]);
		expect(getWonderNameSuggestions({ options, games: [], query: "Rhódos" })).toEqual([]);
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

	it("refuse un nom déjà officiel (toutes éditions, anciens noms compris) ou déjà perso", () => {
		expect(getCustomWonderNameError("ephesos", [])).toBe("Cette merveille existe déjà.");
		expect(getCustomWonderNameError("Éphèse", [])).toBe("Cette merveille existe déjà.");
		expect(getCustomWonderNameError("Stonehenge", [])).toBe("Cette merveille existe déjà.");
		expect(getCustomWonderNameError("ATLANTIDE", [custom("Atlantide")])).toBe(
			"Cette merveille existe déjà.",
		);
	});

	it("laisse une merveille renommée garder son nom, à la casse près", () => {
		expect(getCustomWonderNameError("ATLANTIDE", [custom("Atlantide")], "Atlantide")).toBeNull();
	});
});

describe("toCanonicalWonderName", () => {
	it("rend l'écriture du catalogue, y compris pour un ancien nom", () => {
		expect(toCanonicalWonderName("Alexandrie")).toBe("Alexandria");
		expect(toCanonicalWonderName(" rhodes ")).toBe("Rhódos");
		expect(toCanonicalWonderName("OLYMPIA")).toBe("Olympía");
		expect(toCanonicalWonderName("Pétra")).toBe("Pétra");
	});

	it("rend l'écriture d'une merveille perso, et un nom inconnu tel quel", () => {
		expect(toCanonicalWonderName("atlantide", [custom("Atlantide")])).toBe("Atlantide");
		expect(toCanonicalWonderName("Lémurie ")).toBe("Lémurie ");
		expect(toCanonicalWonderName("")).toBe("");
	});
});

describe("renameWonderInGames", () => {
	it("renomme sans tenir compte de la casse et garde les parties non concernées", () => {
		const touched = makeGame("g1", ["atlantid", "Rhódos"]);
		const untouched = makeGame("g2", ["Ys"]);
		const [renamed, same] = renameWonderInGames([touched, untouched], "Atlantid", "Atlantide");

		expect(Object.values(renamed.entries).map((e) => e.wonder.name)).toEqual([
			"Atlantide",
			"Rhódos",
		]);
		expect(same).toBe(untouched);
	});
});
