import { screen, userEvent } from "@testing-library/react-native";
import CategoryScoreScreen from "@/app/(tabs)/game/score/[category]";
import { useGameStore } from "@/stores/gameStore";
import { useHistoryStore } from "@/stores/historyStore";
import { useWondersStore } from "@/stores/wondersStore";
import { setSearchParams } from "@/test-utils/expoRouter";
import { makeGame, resetAllStores, seedPlayers } from "@/test-utils/fixtures";
import { render } from "@/test-utils/render";
import type { ExtensionId } from "@/types/game";

async function renderWonders(extensions: ExtensionId[] = []) {
	seedPlayers(["Alice", "Bob"]);
	useGameStore.getState().startNewGame(["p1", "p2"], extensions);
	setSearchParams({ category: "wonders" });
	await render(<CategoryScoreScreen />);
}

const entryOf = (playerId: string) => useGameStore.getState().entries[playerId];

describe("Saisie de la merveille jouée", () => {
	beforeEach(() => {
		resetAllStores();
	});
	it("enregistre la merveille jouée, sa face et ses points", async () => {
		const user = userEvent.setup();
		useHistoryStore.setState({
			games: [
				makeGame(
					"old",
					{ p1: 1 },
					{ patch: (e) => ({ ...e, wonder: { name: "Rhodes", side: "A" } }) },
				),
			],
		});
		await renderWonders();

		const [aliceName] = screen.getAllByPlaceholderText("Nom de la merveille");
		await user.type(aliceName, "Rh");
		await user.press(screen.getByRole("button", { name: "Utiliser le nom Rhodes" }));
		await user.press(screen.getAllByRole("radio", { name: "Face B" })[0]);
		await user.press(screen.getAllByRole("button", { name: "Augmenter" })[0]);

		expect(entryOf("p1").wonder).toEqual({ name: "Rhodes", side: "B" });
		expect(entryOf("p1").wonders.points).toBe(1);
		// Rhodes est prise par Alice : elle n'est plus proposée à Bob.
		await user.type(screen.getAllByPlaceholderText("Nom de la merveille")[1], "rh");
		expect(screen.queryByRole("button", { name: "Utiliser le nom Rhodes" })).toBeNull();
	});

	it("propose les merveilles des extensions actives et ajoute une merveille perso", async () => {
		const user = userEvent.setup();
		await renderWonders(["cities"]);

		const [aliceName] = screen.getAllByPlaceholderText("Nom de la merveille");
		// Rien n'est proposé tant que le champ est vide.
		expect(screen.queryByRole("button", { name: "Utiliser le nom Pétra" })).toBeNull();
		await user.type(aliceName, "pe");
		expect(screen.getByRole("button", { name: "Utiliser le nom Pétra" })).toBeOnTheScreen();
		await user.clear(aliceName);
		await user.type(aliceName, "rom");
		expect(screen.queryByRole("button", { name: "Utiliser le nom Rome" })).toBeNull();

		await user.clear(aliceName);
		await user.type(aliceName, "Atlantide");
		await user.press(screen.getByRole("button", { name: "Ajouter Atlantide à mes merveilles" }));

		expect(entryOf("p1").wonder.name).toBe("Atlantide");
		expect(useWondersStore.getState().customWonders.map((w) => w.name)).toEqual(["Atlantide"]);
	});
});
