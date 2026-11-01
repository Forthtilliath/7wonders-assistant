import { shareViewAsImage } from "@forthtilliath/react-native-kit/utils/helpers/shareViewAsImage";
import { act, render, screen, userEvent, within } from "@testing-library/react-native";
import ResultsScreen from "@/app/(tabs)/game/results";
import { exportGameCsv } from "@/lib/backup";
import { shareGameText } from "@/lib/shareGame";
import { useGameStore } from "@/stores/gameStore";
import { useHistoryStore } from "@/stores/historyStore";
import { mockRouter } from "@/test-utils/expoRouter";
import { makeGame, mockAlert, resetAllStores, seedPlayers } from "@/test-utils/fixtures";

jest.mock("@/lib/shareGame", () => ({ shareGameText: jest.fn(() => Promise.resolve()) }));
jest.mock("@forthtilliath/react-native-kit/utils/helpers/shareViewAsImage", () => ({
	shareViewAsImage: jest.fn(() => Promise.resolve()),
}));
jest.mock("@/lib/backup", () => ({ exportGameCsv: jest.fn(() => Promise.resolve()) }));

/** Partie en cours : Alice 12 civils + 3 militaires, Bob 20 civils, Chloé 0. */
async function renderResults() {
	seedPlayers(["Alice", "Bob", "Chloé"]);
	const game = useGameStore.getState();
	game.startNewGame(["p1", "p2", "p3"], ["leaders"]);
	game.updateEntry("p1", (e) => ({ ...e, civilians: { points: 12 }, military: { points: 3 } }));
	game.updateEntry("p2", (e) => ({ ...e, civilians: { points: 20 } }));
	await render(<ResultsScreen />);
}

/** Ligne d'en-tête de la carte classée avec cette médaille (rang, avatar, nom, total). */
const rankRow = (medal: string) => within(screen.getByText(medal).parent!);

describe("Résultats de la partie", () => {
	beforeEach(() => {
		resetAllStores();
		jest.clearAllMocks();
	});

	it("classe les joueurs par total, avec le détail par catégorie", async () => {
		await renderResults();

		expect(rankRow("🥇").getByText("Bob")).toBeOnTheScreen();
		expect(rankRow("🥇").getByText("20")).toBeOnTheScreen();
		expect(rankRow("🥈").getByText("Alice")).toBeOnTheScreen();
		expect(rankRow("🥈").getByText("15")).toBeOnTheScreen();
		expect(rankRow("🥉").getByText("Chloé")).toBeOnTheScreen();
		expect(screen.getByText("Civil 12")).toBeOnTheScreen();
		expect(screen.getByText("Militaire 3")).toBeOnTheScreen();
		expect(screen.getByText(/· Leaders/)).toBeOnTheScreen();
	});

	it("enregistre la partie dans l'historique et ferme la saisie", async () => {
		const user = userEvent.setup();
		await renderResults();

		await user.press(screen.getByRole("button", { name: "Terminer et enregistrer la partie" }));

		const [saved] = useHistoryStore.getState().games;
		expect(saved.playerIds).toEqual(["p1", "p2", "p3"]);
		expect(saved.entries.p2.civilians.points).toBe(20);
		expect(saved.finishedAt).toBeDefined();
		expect(useGameStore.getState().hasOngoingGame()).toBe(false);
		expect(mockRouter.dismissAll).toHaveBeenCalled();
	});

	it("enregistre la correction d'une partie terminée à la place de l'originale", async () => {
		const user = userEvent.setup();
		seedPlayers(["Alice", "Bob"]);
		const game = makeGame("g1", { p1: 10, p2: 20 });
		useHistoryStore.setState({ games: [game] });
		useGameStore.getState().editFinishedGame(game);
		useGameStore.getState().updateEntry("p1", (e) => ({ ...e, civilians: { points: 30 } }));
		await render(<ResultsScreen />);

		await user.press(screen.getByRole("button", { name: "Enregistrer les modifications" }));

		const games = useHistoryStore.getState().games;
		expect(games).toHaveLength(1);
		expect(games[0]).toMatchObject({ id: "g1", finishedAt: game.finishedAt });
		expect(games[0].entries.p1.civilians.points).toBe(30);
		expect(mockRouter.dismissAll).toHaveBeenCalled();
	});

	it("revient à la première catégorie pour corriger la saisie", async () => {
		const user = userEvent.setup();
		await renderResults();

		await user.press(screen.getByRole("button", { name: "Corriger la partie" }));

		expect(mockRouter.dismissTo).toHaveBeenCalledWith("/game/score/military");
		expect(useGameStore.getState().hasOngoingGame()).toBe(true);
	});

	it("partage la partie en texte, image ou CSV", async () => {
		const user = userEvent.setup();
		await renderResults();

		await user.press(screen.getByRole("button", { name: "Partager la partie" }));
		await user.press(screen.getByRole("button", { name: "Partager en Texte" }));
		expect(shareGameText).toHaveBeenCalledWith(
			expect.objectContaining({ playerIds: ["p1", "p2", "p3"] }),
			expect.arrayContaining([expect.objectContaining({ name: "Alice" })]),
		);

		await user.press(screen.getByRole("button", { name: "Partager la partie" }));
		await user.press(screen.getByRole("button", { name: "Partager en Image" }));
		expect(shareViewAsImage).toHaveBeenCalled();

		await user.press(screen.getByRole("button", { name: "Partager la partie" }));
		await user.press(screen.getByRole("button", { name: "Partager en Tableur (CSV)" }));
		expect(exportGameCsv).toHaveBeenCalledWith(
			expect.objectContaining({ extensions: ["leaders"] }),
		);
	});

	it("signale un partage qui échoue", async () => {
		const user = userEvent.setup();
		const alert = mockAlert();
		jest.mocked(shareViewAsImage).mockRejectedValueOnce(new Error("indisponible"));
		await renderResults();

		await user.press(screen.getByRole("button", { name: "Partager la partie" }));
		await user.press(screen.getByRole("button", { name: "Partager en Image" }));
		await act(async () => {});

		expect(alert).toHaveBeenCalledWith("Erreur", "Le partage a échoué.");
	});
});
