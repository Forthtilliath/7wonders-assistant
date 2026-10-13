import { render, screen, userEvent } from "@testing-library/react-native";
import * as ImagePicker from "expo-image-picker";
import { Linking } from "react-native";
import PlayersScreen from "@/app/(tabs)/players";
import EditPlayerScreen from "@/app/players/[id]";
import NewPlayerScreen from "@/app/players/new";
import { storeAvatar, storeCameraAvatar } from "@/lib/avatarFiles";
import { usePlayersStore } from "@/stores/playersStore";
import { mockRouter, setSearchParams } from "@/test-utils/expoRouter";
import { mockAlert, pressAlertButton, resetAllStores, seedPlayers } from "@/test-utils/fixtures";

jest.mock("expo-image-picker", () => ({
	requestMediaLibraryPermissionsAsync: jest.fn(),
	launchImageLibraryAsync: jest.fn(),
	requestCameraPermissionsAsync: jest.fn(),
	launchCameraAsync: jest.fn(),
}));

jest.mock("@/lib/avatarFiles", () => ({
	storeAvatar: jest.fn(async () => "file:///documents/avatars/stored.jpg"),
	storeCameraAvatar: jest.fn(async () => "file:///documents/avatars/camera.jpg"),
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

		it("choisit une photo d'avatar dans la galerie et l'enregistre dans l'app", async () => {
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
			await user.press(screen.getByRole("button", { name: "Choisir dans la galerie" }));
			await user.type(screen.getByPlaceholderText("Ex : Alex"), "Alice");
			await user.press(screen.getByRole("button", { name: "Créer le joueur" }));

			expect(storeAvatar).toHaveBeenCalledWith("file:///avatar.jpg");
			expect(players()[0].avatarUri).toBe("file:///documents/avatars/stored.jpg");
		});

		it("prend le joueur en photo avec l'appareil photo", async () => {
			const user = userEvent.setup();
			jest.mocked(ImagePicker.requestCameraPermissionsAsync).mockResolvedValue({
				granted: true,
			} as ImagePicker.CameraPermissionResponse);
			jest.mocked(ImagePicker.launchCameraAsync).mockResolvedValue({
				canceled: false,
				assets: [{ uri: "file:///cache/capture.jpg" }],
			} as ImagePicker.ImagePickerResult);
			await render(<NewPlayerScreen />);

			// Pas encore de photo : rien à retirer.
			await user.press(screen.getByRole("button", { name: "Changer la photo" }));
			expect(screen.queryByRole("button", { name: "Retirer la photo" })).not.toBeOnTheScreen();
			await user.press(screen.getByRole("button", { name: "Prendre une photo" }));
			await user.type(screen.getByPlaceholderText("Ex : Alex"), "Alice");
			await user.press(screen.getByRole("button", { name: "Créer le joueur" }));

			expect(ImagePicker.launchCameraAsync).toHaveBeenCalledWith(
				expect.objectContaining({ allowsEditing: true, aspect: [1, 1] }),
			);
			expect(storeCameraAvatar).toHaveBeenCalledWith("file:///cache/capture.jpg");
			expect(players()[0].avatarUri).toBe("file:///documents/avatars/camera.jpg");
		});

		it("propose d'ouvrir les réglages si l'accès à l'appareil photo est bloqué", async () => {
			const user = userEvent.setup();
			const alert = mockAlert();
			const openSettings = jest.spyOn(Linking, "openSettings").mockResolvedValue();
			jest.mocked(ImagePicker.requestCameraPermissionsAsync).mockResolvedValue({
				granted: false,
				canAskAgain: false,
			} as ImagePicker.CameraPermissionResponse);
			await render(<NewPlayerScreen />);

			await user.press(screen.getByRole("button", { name: "Changer la photo" }));
			await user.press(screen.getByRole("button", { name: "Prendre une photo" }));
			expect(alert.mock.calls[0][0]).toBe("Accès à l'appareil photo refusé");
			await pressAlertButton(alert, "Ouvrir les réglages");

			expect(openSettings).toHaveBeenCalled();
			expect(ImagePicker.launchCameraAsync).not.toHaveBeenCalled();
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
			await user.press(screen.getByRole("button", { name: "Choisir dans la galerie" }));
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

		it("retire la photo du joueur", async () => {
			const user = userEvent.setup();
			seedPlayers(["Alice"]);
			usePlayersStore
				.getState()
				.updatePlayer("p1", { avatarUri: "file:///documents/avatars/a.jpg" });
			setSearchParams({ id: "p1" });
			await render(<EditPlayerScreen />);

			await user.press(screen.getByRole("button", { name: "Changer la photo" }));
			await user.press(screen.getByRole("button", { name: "Retirer la photo" }));
			await user.press(screen.getByRole("button", { name: "Enregistrer" }));

			expect(players()[0].avatarUri).toBeUndefined();
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
