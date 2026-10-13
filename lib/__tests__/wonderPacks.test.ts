import { MAX_CUSTOM_WONDERS, MAX_WONDER_PACKS } from "@/constants/wonders";
import type { CustomWonder, CustomWonderPack } from "@/types/game";
import type { WonderStats } from "../stats";
import {
	buildWonderGroupIndex,
	filterWonderStatsByGroup,
	getWonderPackNameError,
	getWonderStatGroups,
	parseWonderNameList,
	planCustomWonders,
} from "../wonderPacks";

const wonder = (name: string, packId?: string): CustomWonder => ({
	id: name,
	name,
	...(packId && { packId }),
	createdAt: 0,
});
const pack = (id: string, name: string): CustomWonderPack => ({
	id,
	name,
	selectedByDefault: true,
	createdAt: 0,
});
const stat = (name: string): WonderStats => ({
	name,
	side: "A",
	timesPlayed: 1,
	wins: 1,
	winRate: 1,
	averageTotal: 50,
});

describe("parseWonderNameList", () => {
	it("lit une merveille par ligne, sans lignes vides ni espaces autour", () => {
		expect(parseWonderNameList(" Atlantide \r\n\n Ys\n  ")).toEqual(["Atlantide", "Ys"]);
	});
});

describe("planCustomWonders", () => {
	it("écarte les doublons officiels, existants et internes à la liste", () => {
		const plan = planCustomWonders(
			["Atlantide", "rhodes", "Ys", "ATLANTIDE", "Lémurie"],
			[wonder("Lemurie")],
		);
		expect(plan.accepted).toEqual(["Atlantide", "Ys"]);
		expect(plan.rejected.map((r) => r.name)).toEqual(["rhodes", "ATLANTIDE", "Lémurie"]);
	});

	it("s'arrête au nombre maximal de merveilles perso", () => {
		const existing = Array.from({ length: MAX_CUSTOM_WONDERS - 1 }, (_, i) => wonder(`W${i}`));
		const plan = planCustomWonders(["Atlantide", "Ys"], existing);
		expect(plan.accepted).toEqual(["Atlantide"]);
		expect(plan.rejected).toEqual([
			{ name: "Ys", reason: `${MAX_CUSTOM_WONDERS} merveilles perso au maximum.` },
		]);
	});
});

describe("getWonderPackNameError", () => {
	const packs = [pack("box", "Wonders Box")];

	it("refuse un nom vide, trop long ou déjà pris, sauf l'extension renommée elle-même", () => {
		expect(getWonderPackNameError("  ", packs)).not.toBeNull();
		expect(getWonderPackNameError("A".repeat(101), packs)).not.toBeNull();
		expect(getWonderPackNameError("wonders box", packs)).toBe("Cette extension existe déjà.");
		expect(getWonderPackNameError("Wonders box", packs, "box")).toBeNull();
		expect(getWonderPackNameError("Mes créations", packs)).toBeNull();
	});

	it("refuse une extension de plus au-delà du maximum", () => {
		const full = Array.from({ length: MAX_WONDER_PACKS }, (_, i) => pack(`p${i}`, `P${i}`));
		expect(getWonderPackNameError("Nouvelle", full)).not.toBeNull();
	});
});

describe("groupes des statistiques par merveille", () => {
	const packs = [pack("box", "Wonders Box"), pack("mine", "Mes créations")];
	const customWonders = [wonder("Atlantide", "box"), wonder("Ys"), wonder("Orphan", "deleted")];
	const index = buildWonderGroupIndex(customWonders, packs);
	const stats = [stat("Rhodes"), stat("atlantide"), stat("Ys"), stat("Orphan"), stat("Inconnue")];

	it("ne propose que les groupes joués, extensions par ordre alphabétique", () => {
		expect(getWonderStatGroups(stats, index, packs).map((g) => g.label)).toEqual([
			"Toutes",
			"Officielles",
			"Wonders Box",
			"Mes merveilles",
			"Autres",
		]);
	});

	it("filtre par groupe, sans tenir compte de la casse", () => {
		const names = (key: string) => filterWonderStatsByGroup(stats, index, key).map((s) => s.name);
		expect(names("all")).toHaveLength(5);
		expect(names("official")).toEqual(["Rhodes"]);
		expect(names("pack:box")).toEqual(["atlantide"]);
		// Une merveille dont l'extension n'existe plus compte parmi les merveilles perso.
		expect(names("custom")).toEqual(["Ys", "Orphan"]);
		expect(names("other")).toEqual(["Inconnue"]);
	});
});
