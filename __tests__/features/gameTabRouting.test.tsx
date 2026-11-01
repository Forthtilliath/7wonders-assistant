import { Text } from "react-native";

// Vrai routeur (le reste des tests le simule) : seul moyen de vérifier qu'expo-router laisse bien
// ouvrir l'onglet caché de la partie.
jest.unmock("expo-router");

const { router } = require("expo-router") as typeof import("expo-router");
const { act, renderRouter } =
	require("expo-router/testing-library") as typeof import("expo-router/testing-library");
const TabsLayout = require("@/app/(tabs)/_layout").default;
const GameLayout = require("@/app/(tabs)/game/_layout").default;

function stub(label: string) {
	return () => <Text>{label}</Text>;
}

describe("onglet de la partie", () => {
	it("ouvre la saisie des scores sans revenir à l'accueil", async () => {
		const result = await renderRouter(
			{
				"(tabs)/_layout": TabsLayout,
				"(tabs)/index": stub("Accueil"),
				"(tabs)/players": stub("Joueurs"),
				"(tabs)/history": stub("Historique"),
				"(tabs)/stats": stub("Statistiques"),
				"(tabs)/settings": stub("Réglages"),
				"(tabs)/game/_layout": GameLayout,
				"(tabs)/game/score/[category]": stub("Saisie des scores"),
				"(tabs)/game/results": stub("Résultats"),
			},
			{ initialUrl: "/" },
		);

		await act(async () => router.push("/game/score/military"));

		expect(result.getPathname()).toBe("/game/score/military");
		expect(result.getByText("Saisie des scores")).toBeOnTheScreen();
	});
});
