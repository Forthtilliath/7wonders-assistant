import { getAvatarColor } from "../avatarColor";

describe("getAvatarColor", () => {
	it("retourne toujours la même couleur pour le même identifiant", () => {
		expect(getAvatarColor("player-1")).toBe(getAvatarColor("player-1"));
	});

	it("retourne des couleurs différentes pour des identifiants différents", () => {
		expect(getAvatarColor("Alice")).not.toBe(getAvatarColor("Bob"));
	});

	it("retourne une couleur hexadécimale valide", () => {
		expect(getAvatarColor("quelconque")).toMatch(/^#[0-9a-f]{6}$/i);
	});

	it("offre une bonne variété de couleurs sur un échantillon de joueurs", () => {
		const seeds = Array.from({ length: 30 }, (_, i) => `joueur-${i}`);
		const distinctColors = new Set(seeds.map(getAvatarColor));
		expect(distinctColors.size).toBeGreaterThanOrEqual(15);
	});
});
