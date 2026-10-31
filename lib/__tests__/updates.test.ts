import { downloadAndInstallApk } from "@forthtilliath/expo-release-updates/downloadAndInstallApk";
import { installVerifiedApk } from "@/lib/updates";

jest.mock("@forthtilliath/expo-release-updates/downloadAndInstallApk", () => ({
	downloadAndInstallApk: jest.fn(async () => {}),
}));

const APK_URL =
	"https://github.com/Forthtilliath/7wonders-assistant/releases/download/v9.0.0/7WondersAssistant-9.0.0.apk";

describe("installVerifiedApk", () => {
	beforeEach(() => jest.clearAllMocks());

	it("refuse une release sans empreinte, sans rien télécharger", async () => {
		await expect(installVerifiedApk(APK_URL)).rejects.toThrow("Empreinte");
		expect(downloadAndInstallApk).not.toHaveBeenCalled();
	});

	it("vérifie l'empreinte et limite le téléchargement aux releases du dépôt", async () => {
		const onProgress = jest.fn();
		await installVerifiedApk(APK_URL, onProgress, "d".repeat(64));
		expect(downloadAndInstallApk).toHaveBeenCalledWith({
			apkUrl: APK_URL,
			fileName: "7wonders-update.apk",
			onProgress,
			expectedSha256: "d".repeat(64),
			allowedUrlPrefix: "https://github.com/Forthtilliath/7wonders-assistant/releases/download/",
		});
	});
});
