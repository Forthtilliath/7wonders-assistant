import { downloadAndInstallApk } from "@forthtilliath/expo-release-updates/downloadAndInstallApk";
import { fetchLatestRelease } from "@forthtilliath/expo-release-updates/githubReleases";
import { act, render, screen, userEvent } from "@testing-library/react-native";
import { UpdateBanner } from "@/components/updates/UpdateBanner";
import { useUpdateStore } from "@/stores/updateStore";
import { resetAllStores } from "@/test-utils/fixtures";

jest.mock("@forthtilliath/expo-release-updates/githubReleases", () => ({
	fetchLatestRelease: jest.fn(),
}));
jest.mock("@forthtilliath/expo-release-updates/downloadAndInstallApk", () => ({
	downloadAndInstallApk: jest.fn(async () => {}),
}));

const APK_URL =
	"https://github.com/Forthtilliath/7wonders-assistant/releases/download/v99.0.0/7WondersAssistant-99.0.0.apk";

function mockLatestRelease(version: string) {
	jest
		.mocked(fetchLatestRelease)
		.mockResolvedValue({ version, notes: "### Nouveautés\n- tout", apkUrl: APK_URL });
}

describe("Bandeau de mise à jour", () => {
	beforeEach(() => {
		resetAllStores();
		jest.clearAllMocks();
	});

	it("annonce une version plus récente et l'installe", async () => {
		const user = userEvent.setup();
		mockLatestRelease("99.0.0");
		await render(<UpdateBanner />);

		expect(await screen.findByText("Nouvelle version 99.0.0 disponible")).toBeOnTheScreen();
		// Notes de version écartées : le bandeau reste court sur l'onglet Jouer.
		expect(screen.queryByText(/Nouveautés/)).not.toBeOnTheScreen();
		expect(useUpdateStore.getState().lastCheckedAt).toEqual(expect.any(Number));

		await user.press(screen.getByRole("button", { name: "Installer" }));
		await act(async () => {});

		expect(downloadAndInstallApk).toHaveBeenCalledWith(
			expect.objectContaining({ apkUrl: APK_URL, fileName: "7wonders-update.apk" }),
		);
	});

	it("ne propose plus une version ignorée", async () => {
		const user = userEvent.setup();
		mockLatestRelease("99.0.0");
		const { unmount } = await render(<UpdateBanner />);

		await user.press(await screen.findByRole("button", { name: "Ignorer la version 99.0.0" }));

		expect(useUpdateStore.getState().dismissedVersion).toBe("99.0.0");
		expect(screen.queryByText(/Nouvelle version/)).not.toBeOnTheScreen();

		await unmount();
		useUpdateStore.setState({ lastCheckedAt: null });
		await render(<UpdateBanner />);
		await act(async () => {});

		expect(fetchLatestRelease).toHaveBeenCalledTimes(2);
		expect(screen.queryByText(/Nouvelle version/)).not.toBeOnTheScreen();
	});

	it("n'interroge pas GitHub plus d'une fois toutes les 12 h", async () => {
		mockLatestRelease("99.0.0");
		useUpdateStore.setState({ lastCheckedAt: Date.now() - 60 * 60 * 1000 });
		await render(<UpdateBanner />);
		await act(async () => {});

		expect(fetchLatestRelease).not.toHaveBeenCalled();
		expect(screen.queryByText(/Nouvelle version/)).not.toBeOnTheScreen();
	});

	it("reste masqué si l'app est à jour ou si GitHub ne répond pas", async () => {
		mockLatestRelease("0.0.1");
		const { unmount } = await render(<UpdateBanner />);
		await act(async () => {});
		expect(screen.queryByText(/Nouvelle version/)).not.toBeOnTheScreen();

		await unmount();
		useUpdateStore.setState({ lastCheckedAt: null });
		jest.mocked(fetchLatestRelease).mockRejectedValueOnce(new Error("hors ligne"));
		await render(<UpdateBanner />);
		await act(async () => {});

		expect(fetchLatestRelease).toHaveBeenCalledTimes(2);
		expect(screen.queryByText(/Nouvelle version/)).not.toBeOnTheScreen();
		// Échec compté comme une vérification : pas de nouvel essai à chaque ouverture de l'onglet.
		expect(useUpdateStore.getState().lastCheckedAt).toEqual(expect.any(Number));
	});
});
