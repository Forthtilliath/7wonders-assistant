import { downloadAndInstallApk } from "@forthtilliath/expo-release-updates/downloadAndInstallApk";
import { fetchLatestRelease } from "@forthtilliath/expo-release-updates/githubReleases";
import { isUpdateAvailable } from "@forthtilliath/expo-release-updates/isUpdateAvailable";
import { UpdateInstallCard } from "@forthtilliath/expo-release-updates-ui/UpdateInstallCard";
import { useApkInstall } from "@forthtilliath/expo-release-updates-ui/useApkInstall";
import { useState } from "react";
import { Alert, StyleSheet } from "react-native";
import { Button } from "@/components/ui/Button";
import { useUpdateInstallCardStyles } from "@/components/updates/useUpdateInstallCardStyles";
import { APP_INFO, RELEASES_REPO, UPDATE_APK_FILE_NAME } from "@/constants/app";
import { SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

/**
 * Vérifie la dernière release GitHub et, sur confirmation, télécharge l'APK puis le confie à
 * l'installeur d'Android (qui demande encore confirmation, et refuse un APK qui ne serait pas signé
 * avec la même clé que l'app installée). Seul github.com est accepté comme source du téléchargement.
 */
export function UpdateChecker() {
	const colors = useColors();
	const installCardStyles = useUpdateInstallCardStyles(colors);
	const [checking, setChecking] = useState(false);
	const install = useApkInstall((apkUrl, onProgress) =>
		downloadAndInstallApk({ apkUrl, fileName: UPDATE_APK_FILE_NAME, onProgress }),
	);

	const handleCheck = async () => {
		setChecking(true);
		try {
			const release = await fetchLatestRelease(RELEASES_REPO);
			if (!release) {
				Alert.alert("Erreur", "Impossible de vérifier les mises à jour pour le moment.");
			} else if (!isUpdateAvailable(APP_INFO.version, release.version)) {
				Alert.alert("À jour", "Tu as déjà la dernière version.");
			} else {
				Alert.alert(
					"Mise à jour disponible",
					`Version ${release.version} disponible (tu as la ${APP_INFO.version}).`,
					[
						{ text: "Plus tard", style: "cancel" },
						{ text: "Installer", onPress: () => install.start(release.version, release.apkUrl) },
					],
				);
			}
		} catch {
			Alert.alert("Erreur", "Impossible de vérifier les mises à jour pour le moment.");
		} finally {
			setChecking(false);
		}
	};

	return (
		<>
			<Button
				label={checking ? "Vérification…" : "Vérifier les mises à jour"}
				variant="ghost"
				onPress={handleCheck}
				disabled={checking || install.state.status === "downloading"}
				style={styles.button}
			/>
			<UpdateInstallCard
				state={install.state}
				onRetry={install.retry}
				onClose={install.reset}
				styles={installCardStyles}
			/>
		</>
	);
}

const styles = StyleSheet.create({
	button: {
		marginTop: SPACING.xs,
	},
});
