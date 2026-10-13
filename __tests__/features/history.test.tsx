import { render, screen, userEvent } from "@testing-library/react-native";
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

		it("résume chaque partie avec son vainqueur", async () => {
			await render(<HistoryScreen />);

			expect(screen.getByText("🏆 Alice")).toBeOnTheScreen();
			expect(screen.getByText("30 pts")).toBeOnTheScreen();
			expect(screen.getByText("Cities")).toBeOnTheScreen();
			expect(screen.getByText("🏆 Chloé")).toBeOnTheScreen();
			expect(screen.getByText("3 joueurs")).toBeOnTheScreen();
		});

		it("filtre les parties par joueur", async () => {
			const user = userEvent.setup();
			await render(<HistoryScreen />);

			await user.type(screen.getByPlaceholderText("Rechercher par joueur..."), "chlo");
			expect(screen.getByText("🏆 Chloé")).toBeOnTheScreen();
			expect(screen.queryByText("🏆 Alice")).not.toBeOnTheScreen();

			await user.clear(screen.getByPlaceholderText("Rechercher par joueur..."));
			await user.type(screen.getByPlaceholderText("Rechercher par joueur..."), "inconnu");
			expect(screen.getByText("Aucune partie avec ce joueur.")).toBeOnTheScreen();
		});

		it("ouvre le détail d'une partie", async () => {
			const user = userEvent.setup();
			await render(<HistoryScreen />);

			await user.press(screen.getByText("🏆 Chloé"));

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

		it("signale une partie introuvable", async () => {
			setSearchParams({ id: "inconnue" });
			await render(<GameDetailScreen />);

			expect(screen.getByText("Partie introuvable.")).toBeOnTheScreen();
		});
	});
});
