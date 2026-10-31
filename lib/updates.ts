import { downloadAndInstallApk } from "@forthtilliath/expo-release-updates/downloadAndInstallApk";
import {
	fetchLatestRelease,
	type LatestRelease,
	releaseDownloadUrlPrefix,
} from "@forthtilliath/expo-release-updates/githubReleases";
import { RELEASES_REPO, UPDATE_APK_FILE_NAME } from "@/constants/app";

/** Début de l'adresse de tout fichier attaché à une release de ce dépôt. */
const RELEASE_DOWNLOADS = releaseDownloadUrlPrefix(RELEASES_REPO);

/**
 * Dernière version publiée dont l'APK est vérifiable : une release sans empreinte SHA-256 calculée
 * par GitHub, ou dont l'APK est hors des releases de ce dépôt, est sautée au profit de la suivante.
 */
export function fetchVerifiedLatestRelease(): Promise<LatestRelease | null> {
	return fetchLatestRelease({ ...RELEASES_REPO, requireVerifiedApk: true });
}

/**
 * Télécharge l'APK d'une release de ce dépôt seulement, vérifie son empreinte SHA-256, puis le
 * confie à l'installeur d'Android (qui refuse aussi un APK signé avec une autre clé que l'app).
 */
export function installVerifiedApk(
	apkUrl: string,
	onProgress?: (fraction: number) => void,
	apkSha256?: string,
): Promise<void> {
	if (!apkSha256) {
		return Promise.reject(new Error("Empreinte de la mise à jour absente : installation refusée."));
	}
	return downloadAndInstallApk({
		apkUrl,
		fileName: UPDATE_APK_FILE_NAME,
		onProgress,
		expectedSha256: apkSha256,
		allowedUrlPrefix: RELEASE_DOWNLOADS,
	});
}
