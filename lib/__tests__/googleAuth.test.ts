jest.mock("@/lib/nativeModules", () => ({ isNativeModuleAvailable: jest.fn(() => true) }));
jest.mock("@react-native-google-signin/google-signin", () => ({
	GoogleSignin: {
		configure: jest.fn(),
		hasPlayServices: jest.fn(async () => true),
		signIn: jest.fn(),
		signInSilently: jest.fn(),
		getCurrentUser: jest.fn(),
		getTokens: jest.fn(),
		clearCachedAccessToken: jest.fn(async () => {}),
		revokeAccess: jest.fn(async () => {}),
		signOut: jest.fn(async () => {}),
	},
	isSuccessResponse: (response: { type: string }) => response.type === "success",
	isErrorWithCode: (error: unknown) => error instanceof Error && "code" in error,
	statusCodes: { SIGN_IN_CANCELLED: "12501", PLAY_SERVICES_NOT_AVAILABLE: "2" },
}));

import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { isNativeModuleAvailable } from "@/lib/nativeModules";

type GoogleAuth = typeof import("../googleAuth");

/** Module rechargé à chaque test : il garde en cache la lib Google Sign-In une fois chargée. */
function loadGoogleAuth(): GoogleAuth {
	let mod: GoogleAuth | undefined;
	jest.isolateModules(() => {
		mod = require("../googleAuth");
	});
	return mod!;
}

function codedError(code: string, message = "échec") {
	return Object.assign(new Error(message), { code });
}

const signin = jest.mocked(GoogleSignin);

beforeEach(() => {
	jest.clearAllMocks();
	jest.mocked(isNativeModuleAvailable).mockReturnValue(true);
});

describe("signInToGoogle", () => {
	it("renvoie l'e-mail du compte choisi", async () => {
		signin.signIn.mockResolvedValue({
			type: "success",
			data: { user: { email: "a@b.c" } },
		} as never);

		await expect(loadGoogleAuth().signInToGoogle()).resolves.toBe("a@b.c");
		expect(signin.configure).toHaveBeenCalledWith({
			scopes: [expect.stringContaining("drive.appdata")],
		});
	});

	it("renvoie null si l'utilisateur ferme le sélecteur de compte", async () => {
		const { signInToGoogle } = loadGoogleAuth();

		signin.signIn.mockResolvedValue({ type: "cancelled", data: null } as never);
		await expect(signInToGoogle()).resolves.toBeNull();

		signin.signIn.mockRejectedValue(codedError("12501"));
		await expect(signInToGoogle()).resolves.toBeNull();
	});

	it.each([
		["2", "Les services Google Play sont indisponibles sur ce téléphone."],
		[
			"10",
			"Google ne reconnaît pas cette version de l'app (client OAuth absent ou SHA-1 différente).",
		],
		["7", "La connexion à Google a échoué (code 7)."],
	])("traduit l'erreur Google de code %s en message lisible", async (code, message) => {
		signin.signIn.mockRejectedValue(codedError(code));

		await expect(loadGoogleAuth().signInToGoogle()).rejects.toThrow(message);
	});

	it("traduit une erreur inconnue en message générique", async () => {
		signin.signIn.mockRejectedValue("boom");

		await expect(loadGoogleAuth().signInToGoogle()).rejects.toThrow(
			"La connexion à Google a échoué.",
		);
	});

	it("explique que la fonctionnalité est absente d'un binaire sans le module natif", async () => {
		jest.mocked(isNativeModuleAvailable).mockReturnValue(false);
		const { signInToGoogle, GoogleAuthError } = loadGoogleAuth();

		await expect(signInToGoogle()).rejects.toBeInstanceOf(GoogleAuthError);
		await expect(signInToGoogle()).rejects.toThrow(/n'est pas disponible/);
	});
});

describe("getDriveAccessToken", () => {
	it("renvoie le jeton du compte déjà connecté", async () => {
		signin.getCurrentUser.mockReturnValue({} as never);
		signin.getTokens.mockResolvedValue({ accessToken: "jeton", idToken: "" });

		await expect(loadGoogleAuth().getDriveAccessToken()).resolves.toBe("jeton");
		expect(signin.signInSilently).not.toHaveBeenCalled();
	});

	it("se reconnecte silencieusement au démarrage de l'app", async () => {
		signin.getCurrentUser.mockReturnValue(null);
		signin.signInSilently.mockResolvedValue({ type: "success" } as never);
		signin.getTokens.mockResolvedValue({ accessToken: "jeton", idToken: "" });

		await expect(loadGoogleAuth().getDriveAccessToken()).resolves.toBe("jeton");
	});

	it("demande de reconnecter le compte si l'accès a été révoqué", async () => {
		signin.getCurrentUser.mockReturnValue(null);
		signin.signInSilently.mockResolvedValue({ type: "noSavedCredentialFound" } as never);

		await expect(loadGoogleAuth().getDriveAccessToken()).rejects.toThrow(/Reconnecte ton compte/);
	});

	it("signale un jeton impossible à obtenir", async () => {
		signin.getCurrentUser.mockReturnValue({} as never);
		signin.getTokens.mockRejectedValue(new Error("réseau"));

		await expect(loadGoogleAuth().getDriveAccessToken()).rejects.toThrow(
			"Impossible d'obtenir l'accès à Google Drive.",
		);
	});
});

describe("invalidateDriveAccessToken / signOutFromGoogle", () => {
	it("oublie un jeton refusé sans échouer", async () => {
		signin.clearCachedAccessToken.mockRejectedValue(new Error("déjà expiré"));

		await expect(loadGoogleAuth().invalidateDriveAccessToken("jeton")).resolves.toBeUndefined();
		expect(signin.clearCachedAccessToken).toHaveBeenCalledWith("jeton");
	});

	it("révoque l'accès puis ferme la session, même si la révocation échoue", async () => {
		signin.revokeAccess.mockRejectedValue(new Error("hors ligne"));

		await loadGoogleAuth().signOutFromGoogle();

		expect(signin.revokeAccess).toHaveBeenCalled();
		expect(signin.signOut).toHaveBeenCalled();
	});

	it("ne fait rien sans le module natif", async () => {
		jest.mocked(isNativeModuleAvailable).mockReturnValue(false);

		await expect(loadGoogleAuth().signOutFromGoogle()).resolves.toBeUndefined();
		expect(signin.signOut).not.toHaveBeenCalled();
	});
});
