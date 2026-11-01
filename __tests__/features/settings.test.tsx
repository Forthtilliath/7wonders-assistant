import { useBackupState } from "@forthtilliath/expo-backup-ui/hooks";
import { downloadAndInstallApk } from "@forthtilliath/expo-release-updates/downloadAndInstallApk";
import { fetchLatestRelease } from "@forthtilliath/expo-release-updates/githubReleases";
import { act, render, screen, userEvent } from "@testing-library/react-native";
import { Linking } from "react-native";
import AboutSettingsScreen from "@/app/(tabs)/settings/about";
import AppearanceSettingsScreen from "@/app/(tabs)/settings/appearance";
import ChangelogSettingsScreen from "@/app/(tabs)/settings/changelog";
import DangerZoneSettingsScreen from "@/app/(tabs)/settings/danger-zone";
import DonateSettingsScreen from "@/app/(tabs)/settings/donate";
import SettingsScreen from "@/app/(tabs)/settings/index";
import NewGameSettingsScreen from "@/app/(tabs)/settings/new-game";
import WondersSettingsScreen from "@/app/(tabs)/settings/wonders";
import { CHANGELOG } from "@/constants/changelog";
import { useGroupsStore } from "@/stores/groupsStore";
import { useHistoryStore } from "@/stores/historyStore";
import { usePlayersStore } from "@/stores/playersStore";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { useThemeStore } from "@/stores/themeStore";
import { useWondersStore } from "@/stores/wondersStore";
import { mockRouter } from "@/test-utils/expoRouter";
import {
	makeGame,
	makeGroup,
	mockAlert,
	pressAlertButton,
	resetAllStores,
	seedPlayers,
} from "@/test-utils/fixtures";

jest.mock("@forthtilliath/expo-release-updates/githubReleases", () => ({
	...jest.requireActual("@forthtilliath/expo-release-updates/githubReleases"),
	fetchLatestRelease: jest.fn(),
}));
jest.mock("@forthtilliath/expo-release-updates/downloadAndInstallApk", () => ({
	downloadAndInstallApk: jest.fn(async () => {}),
}));
// État des sauvegardes (expo-backup) : seul le compte Drive relié est lu par le menu.
jest.mock("@/lib/backup", () => ({ backup: {} }));
jest.mock("@forthtilliath/expo-backup-ui/hooks", () => ({
	useBackupState: jest.fn(() => ({ cloudAccount: null })),
}));

describe("Réglages", () => {
	beforeEach(() => {
		resetAllStores();
		jest.clearAllMocks();
	});

	it("résume chaque réglage et ouvre son écran", async () => {
		const user = userEvent.setup();
		usePreferencesStore.setState({ defaultExtensions: ["leaders", "armada"] });
		jest.mocked(useBackupState).mockReturnValue({ cloudAccount: { email: "a@b.c" } } as never);
		await render(<SettingsScreen />);

		await user.press(screen.getByRole("button", { name: "Apparence, Sombre" }));
		await user.press(
			screen.getByRole("button", { name: "Édition et extensions, 1re édition, Leaders, Armada" }),
		);
		await user.press(screen.getByRole("button", { name: "Merveilles, 15 officielles" }));
		await user.press(
			screen.getByRole("button", {
				name: "Gestion des sauvegardes, Sauvegarde Google Drive activée",
			}),
		);
		await user.press(
			screen.getByRole("button", { name: /^Nouveautés, Version \d+\.\d+\.\d+(-[\w.]+)?$/ }),
		);
		await user.press(screen.getByRole("button", { name: /^Dons/ }));
		await user.press(screen.getByRole("button", { name: /^À propos/ }));
		await user.press(screen.getByRole("button", { name: /^Zone dangereuse/ }));

		expect(mockRouter.push.mock.calls.map(([path]) => path)).toEqual([
			"/settings/appearance",
			"/settings/new-game",
			"/settings/wonders",
			"/settings/backup",
			"/settings/changelog",
			"/settings/donate",
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

		await user.press(screen.getByRole("checkbox", { name: "Cities" }));
		await user.press(screen.getByRole("checkbox", { name: "Armada" }));
		await user.press(screen.getByRole("checkbox", { name: "Cities" }));

		expect(usePreferencesStore.getState().defaultExtensions).toEqual(["armada"]);
		expect(screen.getByRole("checkbox", { name: "Armada" })).toBeChecked();
	});

	it("filtre les extensions par défaut selon l'édition et signale Babel + Edifice", async () => {
		const user = userEvent.setup();
		await render(<NewGameSettingsScreen />);

		await user.press(screen.getByRole("checkbox", { name: "Babel" }));
		await user.press(screen.getByRole("checkbox", { name: "Edifice" }));
		expect(screen.getByText(/Edifice remplace Babel/)).toBeOnTheScreen();

		await user.press(screen.getByRole("radio", { name: "2e édition" }));

		expect(usePreferencesStore.getState()).toMatchObject({
			defaultEdition: "second",
			defaultExtensions: ["edifice"],
		});
		expect(screen.queryByRole("checkbox", { name: "Babel" })).not.toBeOnTheScreen();
		expect(screen.queryByText(/Edifice remplace Babel/)).not.toBeOnTheScreen();
	});

	describe("merveilles", () => {
		it("liste les merveilles officielles par jeu de base et extension", async () => {
			await render(<WondersSettingsScreen />);

			expect(screen.getByText("Jeu de base")).toBeOnTheScreen();
			expect(screen.getByText("Cities")).toBeOnTheScreen();
			expect(screen.getByText("Pétra")).toBeOnTheScreen();
			expect(screen.getByText("Stonehenge")).toBeOnTheScreen();
		});

		it("ajoute une merveille perso, refuse un doublon, puis la supprime", async () => {
			const user = userEvent.setup();
			const alert = mockAlert();
			await render(<WondersSettingsScreen />);
			const field = screen.getByPlaceholderText("Nouvelles merveilles, une par ligne");

			await user.type(field, "Atlantide");
			await user.press(screen.getByRole("button", { name: "Ajouter" }));
			expect(useWondersStore.getState().customWonders.map((w) => w.name)).toEqual(["Atlantide"]);
			expect(screen.getByText("Atlantide")).toBeOnTheScreen();

			await user.type(field, "rhodes");
			await user.press(screen.getByRole("button", { name: "Ajouter" }));
			expect(screen.getByText(/rhodes : Cette merveille existe déjà\./)).toBeOnTheScreen();
			expect(useWondersStore.getState().customWonders).toHaveLength(1);

			await user.press(screen.getByRole("button", { name: "Supprimer Atlantide" }));
			await pressAlertButton(alert, "Supprimer");
			expect(useWondersStore.getState().customWonders).toEqual([]);
		});
	});

	describe("zone dangereuse", () => {
		beforeEach(() => {
			seedPlayers(["Alice", "Bob"]);
			useGroupsStore.setState({ groups: [makeGroup("g1", "Jeudi", ["p1", "p2"])] });
			useHistoryStore.setState({ games: [makeGame("g1", { p1: 1, p2: 2 })] });
			useWondersStore.setState({ customWonders: [{ id: "w1", name: "Atlantide", createdAt: 0 }] });
		});

		it("efface joueurs, groupes, merveilles perso et historique après confirmation", async () => {
			const user = userEvent.setup();
			const alert = mockAlert();
			await render(<DangerZoneSettingsScreen />);

			await user.press(screen.getByRole("button", { name: "Effacer toutes les données" }));
			await pressAlertButton(alert, "Tout effacer");

			expect(usePlayersStore.getState().players).toEqual([]);
			expect(useGroupsStore.getState().groups).toEqual([]);
			expect(useHistoryStore.getState().games).toEqual([]);
			expect(useWondersStore.getState().customWonders).toEqual([]);
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
		it("télécharge et installe une nouvelle version après confirmation", async () => {
			const user = userEvent.setup();
			const alert = mockAlert();
			jest.mocked(fetchLatestRelease).mockResolvedValue({
				version: "99.0.0",
				notes: "",
				apkUrl:
					"https://github.com/Forthtilliath/7wonders-assistant/releases/download/v99.0.0/app.apk",
				apkSha256: "b".repeat(64),
			});
			await render(<AboutSettingsScreen />);

			await user.press(screen.getByRole("button", { name: "Vérifier les mises à jour" }));
			expect(fetchLatestRelease).toHaveBeenCalledWith({
				owner: "Forthtilliath",
				repo: "7wonders-assistant",
				requireVerifiedApk: true,
			});
			expect(alert.mock.calls[0][0]).toBe("Mise à jour disponible");
			await pressAlertButton(alert, "Installer");
			await act(async () => {});

			expect(downloadAndInstallApk).toHaveBeenCalledWith(
				expect.objectContaining({
					apkUrl:
						"https://github.com/Forthtilliath/7wonders-assistant/releases/download/v99.0.0/app.apk",
					expectedSha256: "b".repeat(64),
					allowedUrlPrefix:
						"https://github.com/Forthtilliath/7wonders-assistant/releases/download/",
				}),
			);
		});

		it("confirme que l'app est à jour, ou signale l'échec de la vérification", async () => {
			const user = userEvent.setup();
			const alert = mockAlert();
			jest
				.mocked(fetchLatestRelease)
				.mockResolvedValueOnce({ version: "0.0.1", notes: "", apkUrl: "https://github.com/a.apk" })
				.mockRejectedValueOnce(new Error("GitHub responded with 503"));
			await render(<AboutSettingsScreen />);

			await user.press(screen.getByRole("button", { name: "Vérifier les mises à jour" }));
			await user.press(screen.getByRole("button", { name: "Vérifier les mises à jour" }));

			expect(alert.mock.calls.map(([title]) => title)).toEqual(["À jour", "Erreur"]);
			expect(downloadAndInstallApk).not.toHaveBeenCalled();
		});
	});

	it("affiche une entrée de nouveautés par version", async () => {
		await render(<ChangelogSettingsScreen />);

		expect(screen.getAllByText(/^Version \d+\.\d+\.\d+(-[\w.]+)?$/)).toHaveLength(CHANGELOG.length);
	});

	it("vérifie les mises à jour depuis les nouveautés", async () => {
		const user = userEvent.setup();
		const alert = mockAlert();
		jest.mocked(fetchLatestRelease).mockResolvedValue({
			version: "99.0.0",
			notes: "",
			apkUrl: "https://github.com/Forthtilliath/7wonders-assistant/releases/download/v99.0.0/a.apk",
			apkSha256: "c".repeat(64),
		});
		await render(<ChangelogSettingsScreen />);

		expect(screen.getByText(/^Version installée : \d+\.\d+\.\d+(-[\w.]+)?$/)).toBeOnTheScreen();
		await user.press(screen.getByRole("button", { name: "Vérifier les mises à jour" }));
		await pressAlertButton(alert, "Installer");
		await act(async () => {});

		expect(downloadAndInstallApk).toHaveBeenCalledWith(
			expect.objectContaining({ expectedSha256: "c".repeat(64) }),
		);
	});

	it("ouvre la page de dons", async () => {
		const user = userEvent.setup();
		const openURL = jest.spyOn(Linking, "openURL").mockResolvedValue(true);
		await render(<DonateSettingsScreen />);

		await user.press(screen.getByRole("button", { name: "Faire un don" }));

		expect(openURL).toHaveBeenCalledWith("https://buymeacoffee.com/forthtilliath");
	});
});
