import { DRIVE_SCOPE } from "@/lib/googleDrive";

type GoogleSigninModule = typeof import("@react-native-google-signin/google-signin");

/** Connexion Google refusée ou impossible, avec un message affichable tel quel. */
export class GoogleAuthError extends Error {}

let signinModule: GoogleSigninModule | null = null;

/**
 * Chargement à la demande plutôt qu'un import en tête de fichier : la lib exige son module natif
 * dès l'import, et ce fichier est importé (indirectement) par le layout racine. Sur un binaire
 * compilé sans ce module (ancienne build de dev, Expo Go), un import statique ferait planter toute
 * l'app au démarrage ; ici, seule la sauvegarde Google Drive est indisponible.
 *
 * Pas de `webClientId` : l'app n'a pas de serveur, elle n'a besoin que d'un jeton d'accès Drive
 * côté appareil, ce que fournit le client OAuth "Android" (nom de package + empreinte SHA-1 de la
 * clé de signature) déclaré dans la console Google Cloud.
 */
function loadGoogleSignin(): GoogleSigninModule {
	if (signinModule) return signinModule;
	try {
		const loaded: GoogleSigninModule = require("@react-native-google-signin/google-signin");
		loaded.GoogleSignin.configure({ scopes: [DRIVE_SCOPE] });
		signinModule = loaded;
		return loaded;
	} catch {
		throw new GoogleAuthError(
			"La sauvegarde Google Drive n'est pas disponible dans cette version de l'app.",
		);
	}
}

/** Ouvre le sélecteur de compte Google. Renvoie l'e-mail du compte, ou null si annulé. */
export async function signInToGoogle(): Promise<string | null> {
	const { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } = loadGoogleSignin();
	try {
		await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
		const response = await GoogleSignin.signIn();
		if (!isSuccessResponse(response)) return null;
		return response.data.user.email;
	} catch (error) {
		if (isErrorWithCode(error)) {
			if (error.code === statusCodes.SIGN_IN_CANCELLED) return null;
			if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
				throw new GoogleAuthError("Les services Google Play sont indisponibles sur ce téléphone.");
			}
		}
		throw new GoogleAuthError("La connexion à Google a échoué.");
	}
}

/**
 * Jeton d'accès Drive pour le compte déjà relié, sans interaction (reconnexion silencieuse au
 * besoin, le jeton étant rafraîchi par les services Google Play). Lève une `GoogleAuthError` si
 * l'accès a été révoqué : l'utilisateur doit alors reconnecter son compte.
 */
export async function getDriveAccessToken(): Promise<string> {
	const { GoogleSignin } = loadGoogleSignin();
	try {
		if (!GoogleSignin.getCurrentUser()) {
			const response = await GoogleSignin.signInSilently();
			if (response.type !== "success") {
				throw new GoogleAuthError("Reconnecte ton compte Google pour reprendre la sauvegarde.");
			}
		}
		const { accessToken } = await GoogleSignin.getTokens();
		return accessToken;
	} catch (error) {
		if (error instanceof GoogleAuthError) throw error;
		throw new GoogleAuthError("Impossible d'obtenir l'accès à Google Drive.");
	}
}

/** Jeton refusé par Drive (expiré côté serveur) : on l'oublie pour en obtenir un neuf. */
export async function invalidateDriveAccessToken(token: string): Promise<void> {
	await loadGoogleSignin()
		.GoogleSignin.clearCachedAccessToken(token)
		.catch(() => {});
}

/** Retire l'autorisation donnée à l'app (pas seulement la session locale), sans échouer. */
export async function signOutFromGoogle(): Promise<void> {
	let GoogleSignin: GoogleSigninModule["GoogleSignin"];
	try {
		GoogleSignin = loadGoogleSignin().GoogleSignin;
	} catch {
		return;
	}
	await GoogleSignin.revokeAccess().catch(() => {});
	await GoogleSignin.signOut().catch(() => {});
}
