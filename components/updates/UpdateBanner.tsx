import { downloadAndInstallApk } from "@forthtilliath/expo-release-updates/downloadAndInstallApk";
import { fetchLatestRelease } from "@forthtilliath/expo-release-updates/githubReleases";
import type { UpdateAvailableBannerStyles } from "@forthtilliath/expo-release-updates-ui/UpdateAvailableBanner";
import { UpdateNotifier } from "@forthtilliath/expo-release-updates-ui/UpdateNotifier";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { useUpdateInstallCardStyles } from "@/components/updates/useUpdateInstallCardStyles";
import { APP_INFO, RELEASES_REPO, UPDATE_APK_FILE_NAME } from "@/constants/app";
import type { ThemeColors } from "@/constants/theme";
import { cardSurface, RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { useUpdateStore, useUpdateStoreHydrated } from "@/stores/updateStore";

// Les notes d'une release (une quinzaine de lignes) prendraient tout l'onglet : le bandeau s'en
// tient à la version, les nouveautés restent dans Réglages ▸ Nouveautés une fois l'app à jour.
async function fetchLatestReleaseWithoutNotes() {
	const release = await fetchLatestRelease(RELEASES_REPO);
	return release && { ...release, notes: "" };
}

function installApk(apkUrl: string, onProgress?: (fraction: number) => void) {
	return downloadAndInstallApk({ apkUrl, fileName: UPDATE_APK_FILE_NAME, onProgress });
}

/**
 * Annonce une nouvelle version au lancement (au plus une vérification GitHub toutes les 12 h) :
 * "Installer" télécharge l'APK et le confie à l'installeur d'Android, "Ignorer" ne propose plus
 * cette version. Rien ne s'affiche si l'app est à jour ou si la vérification échoue (hors ligne…).
 */
export function UpdateBanner() {
	const colors = useColors();
	const bannerStyles = useBannerStyles(colors);
	const installCardStyles = useUpdateInstallCardStyles(colors);
	const hydrated = useUpdateStoreHydrated();
	const setLastCheckedAt = useUpdateStore((s) => s.setLastCheckedAt);
	const dismissVersion = useUpdateStore((s) => s.dismissVersion);

	return (
		<UpdateNotifier
			enabled={hydrated}
			currentVersion={APP_INFO.version}
			checkForUpdate={fetchLatestReleaseWithoutNotes}
			getLastCheck={() => useUpdateStore.getState()}
			onChecked={setLastCheckedAt}
			onDismissVersion={dismissVersion}
			downloadAndInstallApk={installApk}
			labels={{ banner: { title: (version) => `Nouvelle version ${version} disponible` } }}
			styles={{ banner: bannerStyles, install: installCardStyles }}
		/>
	);
}

function useBannerStyles(colors: ThemeColors): UpdateAvailableBannerStyles {
	return useMemo(
		() =>
			StyleSheet.create({
				container: {
					...cardSurface(colors),
					borderRadius: RADIUS.md,
					borderWidth: 1,
					borderColor: colors.gold,
					padding: SPACING.md,
					gap: SPACING.sm,
				},
				title: {
					flexShrink: 1,
					color: colors.text,
					fontSize: 15,
					fontWeight: "700",
				},
				actionButton: {
					backgroundColor: colors.primary,
					borderRadius: RADIUS.sm,
				},
				actionButtonText: {
					color: colors.primaryText,
				},
				dismissButtonText: {
					color: colors.textMuted,
					fontWeight: "600",
				},
			}),
		[colors],
	);
}
