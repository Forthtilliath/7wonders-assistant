import { migrateThemeStoreData, THEME_STORE_VERSION, useThemeStore } from "../themeStore";

describe("useThemeStore", () => {
	beforeEach(() => {
		useThemeStore.setState({ mode: "dark" });
	});

	it("est en mode sombre par défaut", () => {
		expect(useThemeStore.getState().mode).toBe("dark");
	});

	it("setMode change le mode courant", () => {
		useThemeStore.getState().setMode("light");
		expect(useThemeStore.getState().mode).toBe("light");
	});
});

describe("migrateThemeStoreData", () => {
	it("garde les données à la version courante", () => {
		const state = { mode: "light" as const };
		expect(migrateThemeStoreData(state, THEME_STORE_VERSION)).toBe(state);
	});

	it("revient au mode sombre par défaut sur une version incompatible", () => {
		expect(migrateThemeStoreData({ mode: "obsolète" }, 0)).toEqual({ mode: "dark" });
	});
});
