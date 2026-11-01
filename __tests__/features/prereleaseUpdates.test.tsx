import { fetchLatestRelease } from "@forthtilliath/expo-release-updates/githubReleases";
import { act, fireEvent, render, screen, userEvent } from "@testing-library/react-native";
import AboutSettingsScreen from "@/app/(tabs)/settings/about";
import { UpdateBanner } from "@/components/updates/UpdateBanner";
import { useUpdateStore } from "@/stores/updateStore";
import { mockAlert, resetAllStores } from "@/test-utils/fixtures";

jest.mock("@forthtilliath/expo-release-updates/githubReleases", () => ({
	...jest.requireActual("@forthtilliath/expo-release-updates/githubReleases"),
	fetchLatestRelease: jest.fn(),
}));
jest.mock("@forthtilliath/expo-release-updates/downloadAndInstallApk", () => ({
	downloadAndInstallApk: jest.fn(async () => {}),
}));

const LABEL = "Recevoir les versions de test";

function mockLatestRelease(version: string) {
	jest.mocked(fetchLatestRelease).mockResolvedValue({
		version,
		notes: "",
		apkUrl: `https://github.com/Forthtilliath/7wonders-assistant/releases/download/v${version}/a.apk`,
		apkSha256: "e".repeat(64),
	});
}

describe("Versions de test (alpha, bêta)", () => {
	beforeEach(() => {
		resetAllStores();
		jest.clearAllMocks();
	});

	it("cherche les pré-releases seulement si l'interrupteur est activé", async () => {
		const user = userEvent.setup();
		mockAlert();
		mockLatestRelease("0.0.1");
		useUpdateStore.setState({ prereleases: false });
		await render(<AboutSettingsScreen />);

		expect(screen.getByRole("switch", { name: LABEL })).not.toBeChecked();
		await user.press(screen.getByRole("button", { name: "Vérifier les mises à jour" }));
		expect(fetchLatestRelease).toHaveBeenLastCalledWith(
			expect.objectContaining({ includePrereleases: false, requireVerifiedApk: true }),
		);

		await fireEvent(screen.getByRole("switch", { name: LABEL }), "valueChange", true);
		expect(useUpdateStore.getState().prereleases).toBe(true);
		expect(screen.getByRole("switch", { name: LABEL })).toBeChecked();

		await user.press(screen.getByRole("button", { name: "Vérifier les mises à jour" }));
		expect(fetchLatestRelease).toHaveBeenLastCalledWith(
			expect.objectContaining({ includePrereleases: true, requireVerifiedApk: true }),
		);
	});

	it("annonce une alpha dans le bandeau quand l'appareil y est inscrit", async () => {
		mockLatestRelease("99.0.0-alpha.1");
		useUpdateStore.setState({ prereleases: true });
		await render(<UpdateBanner />);

		expect(await screen.findByText("Nouvelle version 99.0.0-alpha.1 disponible")).toBeOnTheScreen();
		expect(fetchLatestRelease).toHaveBeenCalledWith(
			expect.objectContaining({ includePrereleases: true }),
		);
	});

	it("s'en tient aux stables dans le bandeau sinon", async () => {
		mockLatestRelease("0.0.1");
		useUpdateStore.setState({ prereleases: false });
		await render(<UpdateBanner />);
		await act(async () => {});

		expect(fetchLatestRelease).toHaveBeenCalledWith(
			expect.objectContaining({ includePrereleases: false }),
		);
	});
});
