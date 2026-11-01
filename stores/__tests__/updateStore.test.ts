import { resolvePrereleases, useUpdateStore } from "@/stores/updateStore";
import { resetAllStores } from "@/test-utils/fixtures";

describe("versions de test", () => {
	beforeEach(() => resetAllStores());

	it("suit la version installée tant que rien n'est choisi", () => {
		expect(resolvePrereleases(null, "1.6.0-alpha.2")).toBe(true);
		expect(resolvePrereleases(null, "1.5.0")).toBe(false);
	});

	it("respecte le choix de l'utilisateur quelle que soit la version installée", () => {
		expect(resolvePrereleases(false, "1.6.0-alpha.2")).toBe(false);
		expect(resolvePrereleases(true, "1.5.0")).toBe(true);
	});

	it("relance la vérification au prochain lancement après un changement", () => {
		useUpdateStore.setState({ lastCheckedAt: Date.now() });
		useUpdateStore.getState().setPrereleases(true);

		expect(useUpdateStore.getState()).toMatchObject({ prereleases: true, lastCheckedAt: null });
	});
});
