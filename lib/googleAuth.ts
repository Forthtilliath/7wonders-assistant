import {
	GoogleSignin,
	isErrorWithCode,
	isSuccessResponse,
	statusCodes,
} from "@react-native-google-signin/google-signin";
import { DRIVE_SCOPE } from "@/lib/googleDrive";

/** Connexion Google refusée ou impossible, avec un message affichable tel quel. */
export class GoogleAuthError extends Error {}

let configured = false;

/**
 * Pas de `webClientId` : l'app n'a pas de serveur, elle n'a besoin que d'un jeton d'accès Drive
 * côté appareil, ce que fournit le client OAuth "Android" (nom de package + empreinte SHA-1 de la
 * clé de signature) déclaré dans la console Google Cloud.
 */
function ensureConfigured() {
	if (configured) return;
	GoogleSignin.configure({ scopes: [DRIVE_SCOPE] });
	configured = true;
}

/** Ouvre le sélecteur de compte Google. Renvoie l'e-mail du compte, ou null si annulé. */
export async function signInToGoogle(): Promise<string | null> {
	ensureConfigured();
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
	ensureConfigured();
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
	await GoogleSignin.clearCachedAccessToken(token).catch(() => {});
}

/** Retire l'autorisation donnée à l'app (pas seulement la session locale), sans échouer. */
export async function signOutFromGoogle(): Promise<void> {
	ensureConfigured();
	await GoogleSignin.revokeAccess().catch(() => {});
	await GoogleSignin.signOut().catch(() => {});
}
