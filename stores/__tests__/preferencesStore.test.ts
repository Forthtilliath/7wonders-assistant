import {
	migratePreferencesStoreData,
	PREFERENCES_STORE_VERSION,
	usePreferencesStore,
} from "../preferencesStore";

describe("usePreferencesStore", () => {
	beforeEach(() => {
		usePreferencesStore.setState({ defaultExtensions: [] });
	});

	it("n'a aucune extension par défaut au départ", () => {
		expect(usePreferencesStore.getState().defaultExtensions).toEqual([]);
	});

	it("setDefaultExtensions remplace la liste courante", () => {
		usePreferencesStore.getState().setDefaultExtensions(["leaders", "armada"]);
		expect(usePreferencesStore.getState().defaultExtensions).toEqual(["leaders", "armada"]);
	});
});

describe("migratePreferencesStoreData", () => {
	it("garde les données à la version courante", () => {
		const state = { defaultExtensions: ["cities" as const] };
		expect(migratePreferencesStoreData(state, PREFERENCES_STORE_VERSION)).toBe(state);
	});

	it("réinitialise sur une version incompatible plutôt que de garder des données obsolètes", () => {
		expect(migratePreferencesStoreData({ defaultExtensions: ["obsolète"] }, 0)).toEqual({
			defaultExtensions: [],
		});
	});
});
