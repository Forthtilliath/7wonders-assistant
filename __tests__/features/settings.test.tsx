import { render, screen, userEvent } from "@testing-library/react-native";
import { Linking } from "react-native";
import AboutSettingsScreen from "@/app/(tabs)/settings/about";
import AppearanceSettingsScreen from "@/app/(tabs)/settings/appearance";
import DangerZoneSettingsScreen from "@/app/(tabs)/settings/danger-zone";
import SettingsScreen from "@/app/(tabs)/settings/index";
import NewGameSettingsScreen from "@/app/(tabs)/settings/new-game";
import { checkForUpdate } from "@/lib/updates";
import { useBackupStore } from "@/stores/backupStore";
import { useGroupsStore } from "@/stores/groupsStore";
import { useHistoryStore } from "@/stores/historyStore";
import { usePlayersStore } from "@/stores/playersStore";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { useThemeStore } from "@/stores/themeStore";
import { mockRouter } from "@/test-utils/expoRouter";
import {
	makeGame,
	makeGroup,
	mockAlert,
	pressAlertButton,
	resetAllStores,
	seedPlayers,
} from "@/test-utils/fixtures";

jest.mock("@/lib/updates", () => ({ checkForUpdate: jest.fn() }));

describe("Réglages", () => {
	beforeEach(() => {
		resetAllStores();
		jest.clearAllMocks();
	});

	it("résume chaque réglage et ouvre son écran", async () => {
		const user = userEvent.setup();
		usePreferencesStore.setState({ defaultExtensions: ["leaders", "armada"] });
		useBackupStore.getState().connectCloud("a@b.c");
		await render(<SettingsScreen />);

		await user.press(screen.getByRole("button", { name: "Apparence, Sombre" }));
		await user.press(
			screen.getByRole("button", { name: "Extensions par défaut, Leaders, Armada" }),
		);
		await user.press(
			screen.getByRole("button", {
				name: "Gestion des sauvegardes, Sauvegarde Google Drive activée",
			}),
		);
		await user.press(screen.getByRole("button", { name: /^À propos/ }));
		await user.press(screen.getByRole("button", { name: /^Zone dangereuse/ }));

		expect(mockRouter.push.mock.calls.map(([path]) => path)).toEqual([
			"/settings/appearance",
			"/settings/new-game",
			"/settings/backup",
			"/settings/about",
			"/settings/danger-zone",
		]);
		expect(screen.getByText(/7 Wonders: Assistant · v\d+\.\d+\.\d+/)).toBeOnTheScreen();
	});

	it("bascule entre thème sombre et clair", async () => {
		const user = userEvent.setup();
		await render(<AppearanceSettingsScreen />);

		expect(screen.getByRole("radio", { name: "Sombre" })).toBeSelected();
		await user.press(screen.getByRole("radio", { name: "Clair" }));

		expect(useThemeStore.getState().mode).toBe("light");
		expect(screen.getByRole("radio", { name: "Clair" })).toBeSelected();
	});

	it("choisit les extensions pré-cochées des nouvelles parties", async () => {
		const user = userEvent.setup();
		await render(<NewGameSettingsScreen />);

		await user.press(screen.getByRole("checkbox", { name: "Cités" }));
		await user.press(screen.getByRole("checkbox", { name: "Armada" }));
		await user.press(screen.getByRole("checkbox", { name: "Cités" }));

		expect(usePreferencesStore.getState().defaultExtensions).toEqual(["armada"]);
		expect(screen.getByRole("checkbox", { name: "Armada" })).toBeChecked();
	});

	describe("zone dangereuse", () => {
		beforeEach(() => {
			seedPlayers(["Alice", "Bob"]);
			useGroupsStore.setState({ groups: [makeGroup("g1", "Jeudi", ["p1", "p2"])] });
			useHistoryStore.setState({ games: [makeGame("g1", { p1: 1, p2: 2 })] });
		});

		it("efface joueurs, groupes et historique après confirmation", async () => {
			const user = userEvent.setup();
			const alert = mockAlert();
			await render(<DangerZoneSettingsScreen />);

			await user.press(screen.getByRole("button", { name: "Effacer toutes les données" }));
			await pressAlertButton(alert, "Tout effacer");

			expect(usePlayersStore.getState().players).toEqual([]);
			expect(useGroupsStore.getState().groups).toEqual([]);
			expect(useHistoryStore.getState().games).toEqual([]);
			expect(mockRouter.back).toHaveBeenCalled();
		});

		it("ne touche à rien si l'utilisateur annule", async () => {
			const user = userEvent.setup();
			const alert = mockAlert();
			await render(<DangerZoneSettingsScreen />);

			await user.press(screen.getByRole("button", { name: "Effacer toutes les données" }));
			await pressAlertButton(alert, "Annuler");

			expect(usePlayersStore.getState().players).toHaveLength(2);
			expect(useHistoryStore.getState().games).toHaveLength(1);
		});
	});

	describe("à propos", () => {
		it("propose de télécharger une nouvelle version", async () => {
			const user = userEvent.setup();
			const alert = mockAlert();
			const openURL = jest.spyOn(Linking, "openURL").mockResolvedValue(true);
			jest.mocked(checkForUpdate).mockResolvedValue({
				status: "update-available",
				version: "99.0.0",
				url: "https://github.com/release",
			});
			await render(<AboutSettingsScreen />);

			await user.press(screen.getByRole("button", { name: "Vérifier les mises à jour" }));
			expect(alert.mock.calls[0][0]).toBe("Mise à jour disponible");
			await pressAlertButton(alert, "Télécharger");

			expect(openURL).toHaveBeenCalledWith("https://github.com/release");
		});

		it("confirme que l'app est à jour, ou signale l'échec de la vérification", async () => {
			const user = userEvent.setup();
			const alert = mockAlert();
			jest
				.mocked(checkForUpdate)
				.mockResolvedValueOnce({ status: "up-to-date" })
				.mockResolvedValueOnce({ status: "error" });
			await render(<AboutSettingsScreen />);

			await user.press(screen.getByRole("button", { name: "Vérifier les mises à jour" }));
			await user.press(screen.getByRole("button", { name: "Vérifier les mises à jour" }));

			expect(alert.mock.calls.map(([title]) => title)).toEqual(["À jour", "Erreur"]);
		});

		it("affiche les nouveautés et ouvre la page de dons", async () => {
			const user = userEvent.setup();
			const openURL = jest.spyOn(Linking, "openURL").mockResolvedValue(true);
			await render(<AboutSettingsScreen />);

			expect(screen.getByText("Nouveautés")).toBeOnTheScreen();
			expect(screen.getAllByText(/^Version \d+\.\d+\.\d+$/).length).toBeGreaterThan(1);
			await user.press(screen.getByRole("button", { name: "Faire un don" }));

			expect(openURL).toHaveBeenCalledWith("https://buymeacoffee.com/forthtilliath");
		});
	});
});
