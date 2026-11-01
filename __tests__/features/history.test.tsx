import { shareViewAsImage } from "@forthtilliath/react-native-kit/utils/helpers/shareViewAsImage";
import { render, screen, userEvent, waitFor } from "@testing-library/react-native";
import HistoryScreen from "@/app/(tabs)/history";
import GameDetailScreen from "@/app/history/[id]";
import { shareGameText } from "@/lib/shareGame";
import { useGameStore } from "@/stores/gameStore";
import { useHistoryStore } from "@/stores/historyStore";
import { usePlayersStore } from "@/stores/playersStore";
import { useWondersStore } from "@/stores/wondersStore";
import { mockRouter, setSearchParams } from "@/test-utils/expoRouter";
import {
	makeGame,
	mockAlert,
	pressAlertButton,
	resetAllStores,
	seedPlayers,
} from "@/test-utils/fixtures";

jest.mock("@/lib/shareGame", () => ({
	shareGameText: jest.fn(() => Promise.resolve()),
}));
jest.mock("@forthtilliath/react-native-kit/utils/helpers/shareViewAsImage", () => ({
	shareViewAsImage: jest.fn(() => Promise.resolve()),
}));

describe("Historique des parties", () => {
	beforeEach(() => {
		resetAllStores();
		jest.clearAllMocks();
		seedPlayers(["Alice", "Bob", "Chloé"]);
	});

	describe("liste", () => {
		beforeEach(() => {
			useHistoryStore.setState({
				games: [
					makeGame("g2", { p1: 30, p2: 20 }, { extensions: ["cities"] }),
					makeGame("g1", { p2: 15, p3: 25, p1: 5 }),
				],
			});
		});

		it("résume chaque partie avec ses joueurs classés", async () => {
			await render(<HistoryScreen />);

			expect(screen.getByText("🥇 30")).toBeOnTheScreen();
			expect(screen.getByText("🥈 20")).toBeOnTheScreen();
			expect(screen.getByText("Cities")).toBeOnTheScreen();
			expect(screen.getByText("🥇 25")).toBeOnTheScreen();
			expect(screen.getByText("🥉 5")).toBeOnTheScreen();
			expect(screen.getAllByText("Alice")).toHaveLength(2);
			expect(screen.getAllByText("Chloé")).toHaveLength(1);
			expect(screen.getByText("3 joueurs")).toBeOnTheScreen();
		});

		it("filtre les parties par joueur", async () => {
			const user = userEvent.setup();
			await render(<HistoryScreen />);

			await user.type(screen.getByPlaceholderText("Rechercher par joueur..."), "chlo");
			expect(screen.getByText("🥇 25")).toBeOnTheScreen();
			expect(screen.queryByText("🥇 30")).not.toBeOnTheScreen();

			await user.clear(screen.getByPlaceholderText("Rechercher par joueur..."));
			await user.type(screen.getByPlaceholderText("Rechercher par joueur..."), "inconnu");
			expect(screen.getByText("Aucune partie avec ce joueur.")).toBeOnTheScreen();
		});

		it("ouvre le détail d'une partie", async () => {
			const user = userEvent.setup();
			await render(<HistoryScreen />);

			await user.press(screen.getByText("🥇 25"));

			expect(mockRouter.push).toHaveBeenCalledWith("/history/g1");
		});
	});

	it("indique qu'aucune partie n'a encore été jouée", async () => {
		await render(<HistoryScreen />);

		expect(screen.getByText("Aucune partie enregistrée pour l'instant.")).toBeOnTheScreen();
	});

	describe("détail", () => {
		beforeEach(() => {
			useHistoryStore.setState({
				games: [makeGame("g1", { p1: 30, p2: 20, p3: 10 }, { extensions: ["leaders"] })],
			});
			setSearchParams({ id: "g1" });
		});

		it("affiche le classement de la partie", async () => {
			await render(<GameDetailScreen />);

			expect(screen.getByText("Alice")).toBeOnTheScreen();
			expect(screen.getByText("Civil 30")).toBeOnTheScreen();
			expect(screen.getByText(/· Leaders/)).toBeOnTheScreen();
		});

		it("affiche les graphiques de la partie à la demande", async () => {
			const user = userEvent.setup();
			await render(<GameDetailScreen />);

			expect(screen.queryByText("Répartition par joueur")).not.toBeOnTheScreen();
			await user.press(screen.getByRole("button", { name: "Voir les graphiques" }));

			expect(screen.getByText("Répartition par joueur")).toBeOnTheScreen();
			expect(screen.getByText("Comparaison par catégorie")).toBeOnTheScreen();

			await user.press(screen.getByRole("button", { name: "Masquer les graphiques" }));
			expect(screen.queryByText("Répartition par joueur")).not.toBeOnTheScreen();
		});

		it("relance une partie avec les mêmes joueurs et extensions", async () => {
			const user = userEvent.setup();
			await render(<GameDetailScreen />);

			await user.press(screen.getByRole("button", { name: "Rejouer avec les mêmes joueurs" }));

			expect(useGameStore.getState()).toMatchObject({
				playerIds: ["p1", "p2", "p3"],
				extensions: ["leaders"],
			});
			expect(mockRouter.push).toHaveBeenCalledWith("/game/score/military");
		});

		it("relance une partie dans son édition", async () => {
			const user = userEvent.setup();
			const game = makeGame("g1", { p1: 30, p2: 20, p3: 10 });
			useHistoryStore.setState({ games: [{ ...game, edition: "second" }] });
			await render(<GameDetailScreen />);

			await user.press(screen.getByRole("button", { name: "Rejouer avec les mêmes joueurs" }));

			expect(useGameStore.getState().edition).toBe("second");
		});

		it("relance une partie avec ses extensions non officielles encore existantes", async () => {
			const user = userEvent.setup();
			const game = makeGame("g1", { p1: 30, p2: 20, p3: 10 });
			useHistoryStore.setState({ games: [{ ...game, wonderPacks: ["box", "deleted"] }] });
			useWondersStore.setState({
				packs: [{ id: "box", name: "Wonders Box", selectedByDefault: false, createdAt: 0 }],
			});
			await render(<GameDetailScreen />);

			await user.press(screen.getByRole("button", { name: "Rejouer avec les mêmes joueurs" }));

			expect(useGameStore.getState().wonderPacks).toEqual(["box"]);
		});

		it("rejoue sans les joueurs supprimés depuis, après confirmation", async () => {
			const user = userEvent.setup();
			const alert = mockAlert();
			usePlayersStore.getState().removePlayer("p3");
			await render(<GameDetailScreen />);

			await user.press(screen.getByRole("button", { name: "Rejouer avec les mêmes joueurs" }));
			expect(useGameStore.getState().hasOngoingGame()).toBe(false);
			await pressAlertButton(alert, "Continuer");

			expect(useGameStore.getState().playerIds).toEqual(["p1", "p2"]);
		});

		it("refuse de rejouer s'il reste moins de 2 joueurs", async () => {
			const user = userEvent.setup();
			const alert = mockAlert();
			usePlayersStore.setState({ players: usePlayersStore.getState().players.slice(0, 1) });
			await render(<GameDetailScreen />);

			await user.press(screen.getByRole("button", { name: "Rejouer avec les mêmes joueurs" }));

			expect(alert.mock.calls[0][0]).toBe("Impossible de rejouer");
			expect(useGameStore.getState().hasOngoingGame()).toBe(false);
		});

		it("rouvre la partie pour la corriger, depuis la première étape", async () => {
			const user = userEvent.setup();
			await render(<GameDetailScreen />);

			await user.press(screen.getByRole("button", { name: "Modifier la partie" }));

			expect(useGameStore.getState()).toMatchObject({
				editingGameId: "g1",
				playerIds: ["p1", "p2", "p3"],
				extensions: ["leaders"],
			});
			expect(useGameStore.getState().entries.p1.civilians.points).toBe(30);
			expect(mockRouter.push).toHaveBeenCalledWith("/game/score/military");
		});

		it("reprend une correction déjà commencée sans perdre ses changements", async () => {
			const user = userEvent.setup();
			const game = useHistoryStore.getState().games[0];
			useGameStore.getState().editFinishedGame(game);
			useGameStore.getState().updateEntry("p1", (e) => ({ ...e, civilians: { points: 99 } }));
			await render(<GameDetailScreen />);

			await user.press(screen.getByRole("button", { name: "Modifier la partie" }));

			expect(useGameStore.getState().entries.p1.civilians.points).toBe(99);
			expect(mockRouter.push).toHaveBeenCalledWith("/game/score/military");
		});

		it("refuse de corriger une partie tant qu'une autre est en cours", async () => {
			const user = userEvent.setup();
			const alert = mockAlert();
			useGameStore.getState().startNewGame(["p1", "p2"], []);
			await render(<GameDetailScreen />);

			await user.press(screen.getByRole("button", { name: "Modifier la partie" }));

			expect(alert.mock.calls[0][0]).toBe("Une partie est en cours");
			expect(useGameStore.getState()).toMatchObject({
				editingGameId: null,
				playerIds: ["p1", "p2"],
			});
			expect(mockRouter.push).not.toHaveBeenCalled();
		});

		it("supprime la partie après confirmation", async () => {
			const user = userEvent.setup();
			const alert = mockAlert();
			await render(<GameDetailScreen />);

			await user.press(screen.getByRole("button", { name: "Supprimer cette partie" }));
			await pressAlertButton(alert, "Supprimer");

			expect(useHistoryStore.getState().games).toEqual([]);
			expect(mockRouter.back).toHaveBeenCalled();
		});

		it("partage la partie", async () => {
			const user = userEvent.setup();
			await render(<GameDetailScreen />);

			await user.press(screen.getByRole("button", { name: "Partager la partie" }));
			await user.press(screen.getByRole("button", { name: "Partager en Texte" }));

			expect(shareGameText).toHaveBeenCalledWith(
				expect.objectContaining({ id: "g1" }),
				expect.any(Array),
			);
		});

		it("partage en image avec les graphiques, même masqués", async () => {
			const user = userEvent.setup();
			let chartsShownDuringCapture = false;
			jest.mocked(shareViewAsImage).mockImplementationOnce(async () => {
				// Image rendue hors écran, masquée aux lecteurs d'écran.
				chartsShownDuringCapture =
					screen.queryByText("Répartition par joueur", { includeHiddenElements: true }) != null;
			});
			await render(<GameDetailScreen />);

			await user.press(screen.getByRole("button", { name: "Partager la partie" }));
			await user.press(screen.getByRole("button", { name: "Partager en Image avec graphiques" }));

			expect(shareViewAsImage).toHaveBeenCalled();
			expect(chartsShownDuringCapture).toBe(true);
			await waitFor(() =>
				expect(
					screen.queryByText("Répartition par joueur", { includeHiddenElements: true }),
				).not.toBeOnTheScreen(),
			);
		});

		it("signale une partie introuvable", async () => {
			setSearchParams({ id: "inconnue" });
			await render(<GameDetailScreen />);

			expect(screen.getByText("Partie introuvable.")).toBeOnTheScreen();
		});
	});
});
