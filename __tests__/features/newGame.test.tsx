import { render, screen, userEvent } from "@testing-library/react-native";
import NewGameTab from "@/app/(tabs)/index";
import { useGameStore } from "@/stores/gameStore";
import { useGroupsStore } from "@/stores/groupsStore";
import { useHistoryStore } from "@/stores/historyStore";
import { usePlayersStore } from "@/stores/playersStore";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { mockRouter } from "@/test-utils/expoRouter";
import {
	makeGame,
	makeGroup,
	mockAlert,
	pressAlertButton,
	resetAllStores,
	seedPlayers,
} from "@/test-utils/fixtures";

// État des sauvegardes (expo-backup) lu par le rappel : chargé, jamais sauvegardé, aucun compte Drive.
jest.mock("@/lib/backup", () => ({ backup: {} }));
jest.mock("@forthtilliath/expo-backup-ui/hooks", () => ({
	useBackupState: () => ({ hydrated: true, lastBackupAt: null, cloudAccount: null }),
}));

describe("Onglet Jouer : lancer une partie", () => {
	beforeEach(() => {
		resetAllStores();
	});

	it("invite à créer un premier joueur quand il n'y en a aucun", async () => {
		const user = userEvent.setup();
		await render(<NewGameTab />);

		expect(screen.getByText("Bienvenue !")).toBeOnTheScreen();
		await user.press(screen.getByRole("button", { name: "Créer mon premier joueur" }));

		expect(mockRouter.push).toHaveBeenCalledWith("/players/new");
	});

	it("pré-sélectionne les favoris et exige au moins 2 joueurs pour lancer", async () => {
		const user = userEvent.setup();
		seedPlayers(["Alice", "Bob", "Chloé"]);
		usePlayersStore.getState().toggleFavorite("p1");
		await render(<NewGameTab />);

		expect(screen.getByRole("checkbox", { name: "Alice, favori" })).toBeChecked();
		expect(screen.getByRole("checkbox", { name: "Bob" })).not.toBeChecked();
		expect(screen.getByText("Joueurs (1/7)")).toBeOnTheScreen();
		expect(screen.getByRole("button", { name: "Lancer la partie" })).toBeDisabled();

		await user.press(screen.getByRole("checkbox", { name: "Bob" }));

		expect(screen.getByText("Joueurs (2/7)")).toBeOnTheScreen();
		expect(screen.getByRole("button", { name: "Lancer la partie" })).toBeEnabled();
	});

	it("lance la partie avec les joueurs et extensions choisis", async () => {
		const user = userEvent.setup();
		seedPlayers(["Alice", "Bob"]);
		usePreferencesStore.setState({ defaultExtensions: ["leaders"] });
		await render(<NewGameTab />);

		// Extensions par défaut pré-cochées, modifiables avant de lancer.
		expect(screen.getByRole("checkbox", { name: "Leaders" })).toBeChecked();
		await user.press(screen.getByRole("checkbox", { name: "Leaders" }));
		await user.press(screen.getByRole("checkbox", { name: "Armada" }));

		await user.press(screen.getByRole("checkbox", { name: "Alice" }));
		await user.press(screen.getByRole("checkbox", { name: "Bob" }));
		await user.press(screen.getByRole("button", { name: "Lancer la partie" }));

		const game = useGameStore.getState();
		expect(game.playerIds).toEqual(["p1", "p2"]);
		expect(game.extensions).toEqual(["armada"]);
		expect(mockRouter.push).toHaveBeenCalledWith("/game/score/military");
	});

	it("n'affiche pas les joueurs archivés", async () => {
		seedPlayers(["Alice"]);
		usePlayersStore.setState((s) => ({
			players: [...s.players, { ...s.players[0], id: "p2", name: "Zoé", isArchived: true }],
		}));
		await render(<NewGameTab />);

		expect(screen.getByRole("checkbox", { name: "Alice" })).toBeOnTheScreen();
		expect(screen.queryByRole("checkbox", { name: "Zoé" })).not.toBeOnTheScreen();
	});

	it("sélectionne d'un coup les membres d'un groupe", async () => {
		const user = userEvent.setup();
		seedPlayers(["Alice", "Bob", "Chloé"]);
		useGroupsStore.setState({ groups: [makeGroup("g1", "Jeudi", ["p1", "p3"])] });
		await render(<NewGameTab />);

		await user.press(screen.getByRole("button", { name: "Sélectionner le groupe Jeudi" }));

		expect(screen.getByRole("button", { name: "Sélectionner le groupe Jeudi" })).toBeSelected();
		expect(screen.getByRole("checkbox", { name: "Alice" })).toBeChecked();
		expect(screen.getByRole("checkbox", { name: "Bob" })).not.toBeChecked();
		expect(screen.getByRole("checkbox", { name: "Chloé" })).toBeChecked();
	});

	it("limite la sélection à 7 joueurs, 8 avec l'extension Cités", async () => {
		const user = userEvent.setup();
		const names = ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9"];
		seedPlayers(names);
		await render(<NewGameTab />);

		for (const name of names) {
			await user.press(screen.getByRole("checkbox", { name }));
		}
		expect(screen.getByText("Joueurs (7/7)")).toBeOnTheScreen();
		expect(screen.getByRole("checkbox", { name: "A8" })).not.toBeChecked();

		await user.press(screen.getByRole("checkbox", { name: "Cités" }));
		await user.press(screen.getByRole("checkbox", { name: "A8" }));
		await user.press(screen.getByRole("checkbox", { name: "A9" }));
		expect(screen.getByText("Joueurs (8/8)")).toBeOnTheScreen();
		expect(screen.getByRole("checkbox", { name: "A9" })).not.toBeChecked();
	});

	it("bloque le lancement si Cités est décochée avec 8 joueurs", async () => {
		const user = userEvent.setup();
		const names = ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8"];
		seedPlayers(names);
		usePreferencesStore.setState({ defaultExtensions: ["cities"] });
		await render(<NewGameTab />);

		for (const name of names) {
			await user.press(screen.getByRole("checkbox", { name }));
		}
		await user.press(screen.getByRole("checkbox", { name: "Cités" }));

		expect(screen.getByText("Joueurs (8/7)")).toBeOnTheScreen();
		expect(screen.getByText(/active l'extension Cités ou/)).toBeOnTheScreen();
		expect(screen.getByRole("button", { name: "Lancer la partie" })).toBeDisabled();
	});

	it("désactive les groupes de 8 joueurs sans l'extension Cités", async () => {
		const user = userEvent.setup();
		seedPlayers(["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8"]);
		useGroupsStore.setState({
			groups: [
				makeGroup("g1", "Grand", ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"]),
				makeGroup("g2", "Petit", ["p1", "p2"]),
			],
		});
		await render(<NewGameTab />);

		const big = screen.getByRole("button", { name: "Sélectionner le groupe Grand" });
		expect(big).toBeDisabled();
		expect(screen.getByRole("button", { name: "Sélectionner le groupe Petit" })).toBeEnabled();

		await user.press(screen.getByRole("checkbox", { name: "Cités" }));
		expect(big).toBeEnabled();
		await user.press(big);
		expect(screen.getByText("Joueurs (8/8)")).toBeOnTheScreen();
	});

	it("bloque la création tant qu'une partie est en cours, avec reprise ou abandon", async () => {
		const user = userEvent.setup();
		const alert = mockAlert();
		seedPlayers(["Alice", "Bob"]);
		useGameStore.getState().startNewGame(["p1", "p2"], []);
		await render(<NewGameTab />);

		expect(screen.getByText("Une partie est en cours")).toBeOnTheScreen();
		await user.press(screen.getByRole("button", { name: "Reprendre la partie en cours" }));
		expect(mockRouter.push).toHaveBeenCalledWith("/game/score/military");

		await user.press(screen.getByRole("button", { name: "Abandonner la partie en cours" }));
		await pressAlertButton(alert, "Abandonner");

		expect(useGameStore.getState().hasOngoingGame()).toBe(false);
		expect(await screen.findByRole("button", { name: "Lancer la partie" })).toBeOnTheScreen();
	});

	it("rappelle de sauvegarder les parties non sauvegardées", async () => {
		const user = userEvent.setup();
		seedPlayers(["Alice", "Bob"]);
		// Rappel déclenché par une partie non sauvegardée depuis plus de 7 jours.
		const createdAt = Date.now() - 30 * 24 * 3_600_000;
		useHistoryStore.setState({ games: [makeGame("g1", { p1: 10, p2: 5 }, { createdAt })] });
		await render(<NewGameTab />);

		expect(screen.getByText("1 partie non sauvegardée")).toBeOnTheScreen();
		await user.press(screen.getByRole("button", { name: "Sauvegarder" }));
		expect(mockRouter.push).toHaveBeenCalledWith("/settings/backup");

		await user.press(screen.getByRole("button", { name: "Plus tard" }));
		expect(screen.queryByText("1 partie non sauvegardée")).not.toBeOnTheScreen();
	});
});
