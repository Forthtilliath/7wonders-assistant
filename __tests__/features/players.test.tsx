import { render, screen, userEvent } from "@testing-library/react-native";
import * as ImagePicker from "expo-image-picker";
import { Linking } from "react-native";
import PlayersScreen from "@/app/(tabs)/players";
import EditPlayerScreen from "@/app/players/[id]";
import NewPlayerScreen from "@/app/players/new";
import { usePlayersStore } from "@/stores/playersStore";
import { mockRouter, setSearchParams } from "@/test-utils/expoRouter";
import { mockAlert, pressAlertButton, resetAllStores, seedPlayers } from "@/test-utils/fixtures";

jest.mock("expo-image-picker", () => ({
	requestMediaLibraryPermissionsAsync: jest.fn(),
	launchImageLibraryAsync: jest.fn(),
}));

const players = () => usePlayersStore.getState().players;

describe("Joueurs", () => {
	beforeEach(() => {
		resetAllStores();
		jest.clearAllMocks();
	});

	describe("liste des joueurs", () => {
		it("trie les favoris en tête et les archivés en fin de liste", async () => {
			seedPlayers(["Chloé", "Alice", "Bob"]);
			usePlayersStore.getState().toggleFavorite("p1");
			usePlayersStore.getState().toggleArchived("p2");
			await render(<PlayersScreen />);

			const names = screen
				.getAllByRole("button", { name: /^Modifier / })
				.map((el) => el.props.accessibilityLabel);
			expect(names).toEqual(["Modifier Chloé", "Modifier Bob", "Modifier Alice"]);
		});

		it("filtre les joueurs par nom", async () => {
			const user = userEvent.setup();
			seedPlayers(["Alice", "Bob"]);
			await render(<PlayersScreen />);

			await user.type(screen.getByPlaceholderText("Rechercher un joueur..."), "ali");
			expect(screen.getByRole("button", { name: "Modifier Alice" })).toBeOnTheScreen();
			expect(screen.queryByRole("button", { name: "Modifier Bob" })).not.toBeOnTheScreen();

			await user.clear(screen.getByPlaceholderText("Rechercher un joueur..."));
			await user.type(screen.getByPlaceholderText("Rechercher un joueur..."), "zzz");
			expect(screen.getByText("Aucun joueur ne correspond à cette recherche.")).toBeOnTheScreen();
		});

		it("met en favori et archive un joueur depuis la liste", async () => {
			const user = userEvent.setup();
			seedPlayers(["Alice"]);
			await render(<PlayersScreen />);

			await user.press(screen.getByRole("button", { name: "Ajouter aux favoris" }));
			await user.press(screen.getByRole("button", { name: "Archiver" }));

			expect(players()[0]).toMatchObject({ isFavorite: true, isArchived: true });
			expect(screen.getByRole("button", { name: "Retirer des favoris" })).toBeSelected();
			expect(screen.getByRole("button", { name: "Désarchiver" })).toBeSelected();
		});

		it("ouvre la création et l'édition de joueurs et de groupes", async () => {
			const user = userEvent.setup();
			seedPlayers(["Alice"]);
			await render(<PlayersScreen />);

			await user.press(screen.getByRole("button", { name: "Ajouter un joueur" }));
			await user.press(screen.getByRole("button", { name: "Modifier Alice" }));
			await user.press(screen.getByRole("button", { name: "Nouveau groupe" }));

			expect(mockRouter.push.mock.calls).toEqual([
				["/players/new"],
				["/players/p1"],
				["/groups/new"],
			]);
		});

		it("indique qu'il n'y a encore aucun joueur", async () => {
			await render(<PlayersScreen />);

			expect(screen.getByText("Aucun joueur pour l'instant.")).toBeOnTheScreen();
		});
	});

	describe("création d'un joueur", () => {
		it("crée le joueur avec un nom nettoyé puis ferme l'écran", async () => {
			const user = userEvent.setup();
			await render(<NewPlayerScreen />);

			expect(screen.getByRole("button", { name: "Créer le joueur" })).toBeDisabled();
			await user.type(screen.getByPlaceholderText("Ex : Alex"), "  Alice  ");
			await user.press(screen.getByRole("button", { name: "Créer le joueur" }));

			expect(players()).toHaveLength(1);
			expect(players()[0].name).toBe("Alice");
			expect(mockRouter.back).toHaveBeenCalled();
		});

		it("prévient quand un joueur du même nom existe déjà", async () => {
			const user = userEvent.setup();
			const alert = mockAlert();
			seedPlayers(["Alice"]);
			await render(<NewPlayerScreen />);

			await user.type(screen.getByPlaceholderText("Ex : Alex"), "alice");
			await user.press(screen.getByRole("button", { name: "Créer le joueur" }));

			expect(players()).toHaveLength(2);
			expect(alert.mock.calls[0][0]).toBe("Un joueur du même nom existe déjà");
			expect(mockRouter.back).not.toHaveBeenCalled();
			await pressAlertButton(alert, "Compris");
			expect(mockRouter.back).toHaveBeenCalled();
		});

		it("choisit une photo d'avatar dans la galerie", async () => {
			const user = userEvent.setup();
			jest.mocked(ImagePicker.requestMediaLibraryPermissionsAsync).mockResolvedValue({
				granted: true,
			} as ImagePicker.MediaLibraryPermissionResponse);
			jest.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValue({
				canceled: false,
				assets: [{ uri: "file:///avatar.jpg" }],
			} as ImagePicker.ImagePickerResult);
			await render(<NewPlayerScreen />);

			await user.press(screen.getByRole("button", { name: "Changer la photo" }));
			await user.type(screen.getByPlaceholderText("Ex : Alex"), "Alice");
			await user.press(screen.getByRole("button", { name: "Créer le joueur" }));

			expect(players()[0].avatarUri).toBe("file:///avatar.jpg");
		});

		it("propose d'ouvrir les réglages si l'accès aux photos est bloqué", async () => {
			const user = userEvent.setup();
			const alert = mockAlert();
			const openSettings = jest.spyOn(Linking, "openSettings").mockResolvedValue();
			jest.mocked(ImagePicker.requestMediaLibraryPermissionsAsync).mockResolvedValue({
				granted: false,
				canAskAgain: false,
			} as ImagePicker.MediaLibraryPermissionResponse);
			await render(<NewPlayerScreen />);

			await user.press(screen.getByRole("button", { name: "Changer la photo" }));
			await pressAlertButton(alert, "Ouvrir les réglages");

			expect(openSettings).toHaveBeenCalled();
			expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
		});
	});

	describe("modification d'un joueur", () => {
		it("renomme le joueur", async () => {
			const user = userEvent.setup();
			seedPlayers(["Alice"]);
			setSearchParams({ id: "p1" });
			await render(<EditPlayerScreen />);

			const nameInput = screen.getByDisplayValue("Alice");
			await user.clear(nameInput);
			await user.type(nameInput, "Alicia");
			await user.press(screen.getByRole("button", { name: "Enregistrer" }));

			expect(players()[0].name).toBe("Alicia");
			expect(mockRouter.back).toHaveBeenCalled();
		});

		it("supprime le joueur après confirmation", async () => {
			const user = userEvent.setup();
			const alert = mockAlert();
			seedPlayers(["Alice", "Bob"]);
			setSearchParams({ id: "p1" });
			await render(<EditPlayerScreen />);

			await user.press(screen.getByRole("button", { name: "Supprimer le joueur" }));
			await pressAlertButton(alert, "Supprimer");

			expect(players().map((p) => p.name)).toEqual(["Bob"]);
			expect(mockRouter.back).toHaveBeenCalled();
		});

		it("signale un joueur introuvable", async () => {
			setSearchParams({ id: "inconnu" });
			await render(<EditPlayerScreen />);

			expect(screen.getByText("Joueur introuvable.")).toBeOnTheScreen();
		});
	});
});
