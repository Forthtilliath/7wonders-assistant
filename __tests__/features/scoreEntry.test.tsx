import { act, render, screen, userEvent } from "@testing-library/react-native";
import CategoryScoreScreen from "@/app/(tabs)/game/score/[category]";
import { useGameStore } from "@/stores/gameStore";
import { mockRouter, setSearchParams } from "@/test-utils/expoRouter";
import {
	mockAlert,
	pressAlertButton,
	resetAllStores,
	seedPlayers,
	withinSheet,
} from "@/test-utils/fixtures";
import type { CategoryId, ExtensionId } from "@/types/game";

async function renderCategory(category: CategoryId, extensions: ExtensionId[] = []) {
	seedPlayers(["Alice", "Bob"]);
	useGameStore.getState().startNewGame(["p1", "p2"], extensions);
	setSearchParams({ category });
	await render(<CategoryScoreScreen />);
}

const entryOf = (playerId: string) => useGameStore.getState().entries[playerId];

describe("Saisie des scores par catégorie", () => {
	beforeEach(() => {
		resetAllStores();
	});

	it("affiche la catégorie, l'étape et un rappel de saisie", async () => {
		await renderCategory("military");

		expect(screen.getByText("Militaire")).toBeOnTheScreen();
		expect(screen.getByText("Étape 1 / 7")).toBeOnTheScreen();
		expect(screen.getByText(/Additionne tes jetons militaires/)).toBeOnTheScreen();
		expect(screen.getByText("Alice")).toBeOnTheScreen();
		expect(screen.getByText("Bob")).toBeOnTheScreen();
	});

	it("ajuste les points avec +/-, négatifs autorisés en militaire", async () => {
		const user = userEvent.setup();
		await renderCategory("military");

		await user.press(screen.getAllByRole("button", { name: "Augmenter" })[0]);
		await user.press(screen.getAllByRole("button", { name: "Augmenter" })[0]);
		await user.press(screen.getAllByRole("button", { name: "Diminuer" })[1]);

		expect(entryOf("p1").military.points).toBe(2);
		expect(entryOf("p2").military.points).toBe(-1);
	});

	it("refuse les points négatifs dans une catégorie qui n'en a pas", async () => {
		const user = userEvent.setup();
		await renderCategory("civilians");

		await user.press(screen.getAllByRole("button", { name: "Diminuer" })[0]);

		expect(entryOf("p1").civilians.points).toBe(0);
	});

	it("accepte une saisie directe au clavier", async () => {
		const user = userEvent.setup();
		await renderCategory("civilians");

		const [aliceInput] = screen.getAllByDisplayValue("0");
		await user.clear(aliceInput);
		await user.type(aliceInput, "23");

		expect(entryOf("p1").civilians.points).toBe(23);
	});

	it("compte les jetons militaires un par un", async () => {
		const user = userEvent.setup();
		await renderCategory("military");

		await user.press(screen.getByRole("button", { name: "Compter les jetons de Bob un par un" }));
		await user.press(screen.getByRole("button", { name: "Augmenter Victoire Âge III (+5)" }));
		await user.press(screen.getByRole("button", { name: "Augmenter Victoire Âge III (+5)" }));
		await user.press(screen.getByRole("button", { name: "Augmenter Défaite (−1)" }));
		expect(screen.getByText("9")).toBeOnTheScreen();

		await user.press(screen.getByRole("button", { name: "Valider" }));

		expect(entryOf("p2").military.points).toBe(9);
		expect(entryOf("p1").military.points).toBe(0);
		expect(screen.queryByText("Jetons militaires")).not.toBeOnTheScreen();
	});

	it("calcule les sciences à partir des symboles", async () => {
		const user = userEvent.setup();
		await renderCategory("scientifics");

		// Par joueur, dans l'ordre : roues, compas, tablettes, symboles au choix, symboles max.
		const aliceRow = screen.getAllByRole("button", { name: "Augmenter" }).slice(0, 5);
		await user.press(aliceRow[0]);
		await user.press(aliceRow[1]);
		await user.press(aliceRow[2]);

		// 1 roue + 1 compas + 1 tablette = 1² × 3 + 7 (un set complet).
		expect(screen.getByText("10 pts")).toBeOnTheScreen();
		expect(screen.getByText("1 set(s) complet(s)")).toBeOnTheScreen();

		await user.press(aliceRow[3]);
		expect(screen.getByText(/Répartition optimale/)).toBeOnTheScreen();
		expect(entryOf("p1").scientifics).toEqual({
			gear: 1,
			compass: 1,
			tablet: 1,
			wildcards: 1,
			maxSymbols: 0,
		});
	});

	it("compte les tuiles Babel posées, après Leaders et Cities", async () => {
		const user = userEvent.setup();
		await renderCategory("babel", ["leaders", "cities", "babel"]);

		expect(screen.getByText("Étape 10 / 10")).toBeOnTheScreen();
		expect(
			screen.getByText(/1 tuile = 2 pts, 2 tuiles = 5 pts, 3 tuiles = 10 pts/),
		).toBeOnTheScreen();

		await user.press(screen.getAllByRole("radio", { name: "3 tuiles" })[0]);
		await user.press(screen.getAllByRole("radio", { name: "1 tuile" })[1]);

		expect(entryOf("p1").babel).toEqual({ tiles: 3 });
		expect(entryOf("p2").babel).toEqual({ tiles: 1 });
		expect(screen.getByText("10 pts")).toBeOnTheScreen();
		expect(screen.getByText("2 pts")).toBeOnTheScreen();

		// Un joueur saisi par erreur peut revenir à zéro tuile.
		await user.press(screen.getAllByRole("radio", { name: "Aucune" })[1]);
		expect(entryOf("p2").babel).toEqual({ tiles: 0 });
	});

	it("passe à l'étape suivante, puis aux résultats depuis la dernière", async () => {
		const user = userEvent.setup();
		await renderCategory("military");

		await user.press(screen.getByRole("button", { name: "Étape suivante" }));
		expect(mockRouter.push).toHaveBeenCalledWith("/game/score/treasury");

		await screen.unmount();
		setSearchParams({ category: "guilds" });
		await render(<CategoryScoreScreen />);

		expect(screen.getByText("Étape 7 / 7")).toBeOnTheScreen();
		await user.press(screen.getByRole("button", { name: "Voir les résultats" }));
		expect(mockRouter.replace).toHaveBeenCalledWith("/game/results");
	});

	it("intègre les catégories des extensions au parcours", async () => {
		await renderCategory("naval", ["armada"]);

		// Base (7) + Armada (jetons navals, juste après le militaire, et score de plateau en fin).
		expect(screen.getByText("Maritime")).toBeOnTheScreen();
		expect(screen.getByText("Étape 2 / 9")).toBeOnTheScreen();
		expect(screen.getByText(/Additionne tes jetons navals/)).toBeOnTheScreen();
		expect(
			screen.getByRole("button", { name: "Compter les jetons de Alice un par un" }),
		).toBeOnTheScreen();
	});

	it("modifie les extensions en cours de partie après confirmation", async () => {
		const user = userEvent.setup();
		const alert = mockAlert();
		await renderCategory("military", ["armada"]);
		await act(() => {
			useGameStore.getState().updateEntry("p1", (e) => ({ ...e, naval: { points: 4 } }));
		});

		await user.press(screen.getByRole("button", { name: "Modifier les extensions de la partie" }));
		const sheet = withinSheet("Extensions de la partie");
		expect(sheet.getByRole("button", { name: "Valider" })).toBeDisabled();

		await user.press(sheet.getByRole("checkbox", { name: "Leaders" }));
		await user.press(sheet.getByRole("checkbox", { name: "Armada" }));
		expect(sheet.getByText("+ Leaders")).toBeOnTheScreen();
		expect(sheet.getByText(/− Maritime, Armada/)).toBeOnTheScreen();

		await user.press(sheet.getByRole("button", { name: "Valider" }));
		await pressAlertButton(alert, "Confirmer");

		expect(useGameStore.getState().extensions).toEqual(["leaders"]);
		// Les points des catégories retirées sont remis à zéro.
		expect(entryOf("p1").naval.points).toBe(0);
	});

	it("compte Edifice avec le trésor, sans étape de score à elle", async () => {
		await renderCategory("treasury", ["edifice"]);

		expect(screen.getByText("Étape 2 / 7")).toBeOnTheScreen();
		expect(screen.getByText(/Edifice : ajoute tes pions Participation/)).toBeOnTheScreen();
	});

	it("ne propose que les extensions de l'édition et signale Babel + Edifice", async () => {
		const user = userEvent.setup();
		const alert = mockAlert();
		seedPlayers(["Alice", "Bob"]);
		useGameStore.getState().startNewGame(["p1", "p2"], ["babel"], "first");
		setSearchParams({ category: "military" });
		await render(<CategoryScoreScreen />);

		await user.press(screen.getByRole("button", { name: "Modifier les extensions de la partie" }));
		const sheet = withinSheet("Extensions de la partie");
		await user.press(sheet.getByRole("checkbox", { name: "Edifice" }));
		expect(sheet.getByText(/Edifice remplace Babel/)).toBeOnTheScreen();

		await user.press(sheet.getByRole("button", { name: "Valider" }));
		expect(alert.mock.calls.at(-1)?.[1]).toBe(
			"Aucune étape de score n'est ajoutée ni retirée.\n\nEdifice remplace Babel : les deux ne se jouent normalement pas ensemble.",
		);
		await pressAlertButton(alert, "Confirmer");
		expect(useGameStore.getState().extensions).toEqual(["babel", "edifice"]);
	});

	it("cache Babel en cours de partie avec la 2e édition", async () => {
		const user = userEvent.setup();
		seedPlayers(["Alice", "Bob"]);
		useGameStore.getState().startNewGame(["p1", "p2"], [], "second");
		setSearchParams({ category: "military" });
		await render(<CategoryScoreScreen />);

		await user.press(screen.getByRole("button", { name: "Modifier les extensions de la partie" }));
		const sheet = withinSheet("Extensions de la partie");
		expect(sheet.getByRole("checkbox", { name: "Edifice" })).toBeOnTheScreen();
		expect(sheet.queryByRole("checkbox", { name: "Babel" })).not.toBeOnTheScreen();
	});

	it("refuse de retirer Cities d'une partie à 8 joueurs", async () => {
		const user = userEvent.setup();
		const ids = ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"];
		seedPlayers(["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8"]);
		useGameStore.getState().startNewGame(ids, ["cities"]);
		setSearchParams({ category: "military" });
		await render(<CategoryScoreScreen />);

		await user.press(screen.getByRole("button", { name: "Modifier les extensions de la partie" }));
		const sheet = withinSheet("Extensions de la partie");
		await user.press(sheet.getByRole("checkbox", { name: "Cities" }));

		expect(sheet.getByText(/8 joueurs dans la partie/)).toBeOnTheScreen();
		expect(sheet.getByRole("button", { name: "Valider" })).toBeDisabled();
	});

	it("redirige vers la première étape si la catégorie n'existe plus", async () => {
		await renderCategory("leaders");

		expect(mockRouter.replace).toHaveBeenCalledWith("/game/score/military");
	});

	it("revient à l'accueil s'il n'y a pas de partie en cours", async () => {
		setSearchParams({ category: "military" });
		await render(<CategoryScoreScreen />);

		expect(mockRouter.replace).toHaveBeenCalledWith("/");
	});
});
