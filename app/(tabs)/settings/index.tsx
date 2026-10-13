import { useBackupState } from "@forthtilliath/expo-backup-ui/hooks";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, Text } from "react-native";
import { SettingsRow } from "@/components/settings/SettingsRow";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { APP_INFO } from "@/constants/app";
import { EXTENSION_LABELS } from "@/constants/categories";
import type { ThemeColors } from "@/constants/theme";
import { SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { backup } from "@/lib/backup";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { useThemeStore } from "@/stores/themeStore";

export default function SettingsScreen() {
	const colors = useColors();
	const styles = useStyles(colors);
	const router = useRouter();
	const mode = useThemeStore((s) => s.mode);
	const defaultExtensions = usePreferencesStore((s) => s.defaultExtensions);
	const cloudConnected = useBackupState(backup).cloudAccount != null;

	const defaultExtensionsPreview =
		defaultExtensions.length > 0
			? defaultExtensions.map((ext) => EXTENSION_LABELS[ext]).join(", ")
			: "Aucune";

	return (
		<ScreenContainer style={styles.container}>
			<SettingsRow
				icon="contrast"
				label="Apparence"
				value={mode === "dark" ? "Sombre" : "Clair"}
				onPress={() => router.push("/settings/appearance")}
			/>
			<SettingsRow
				icon="options"
				label="Extensions par défaut"
				value={defaultExtensionsPreview}
				onPress={() => router.push("/settings/new-game")}
			/>
			<SettingsRow
				icon="cloud-upload"
				label="Gestion des sauvegardes"
				value={
					cloudConnected ? "Sauvegarde Google Drive activée" : "Exporter ou restaurer tes données"
				}
				onPress={() => router.push("/settings/backup")}
			/>
			<SettingsRow
				icon="information-circle"
				label="À propos"
				value="Nouveautés, dons, infos"
				onPress={() => router.push("/settings/about")}
			/>
			<SettingsRow
				icon="warning"
				label="Zone dangereuse"
				value="Effacer toutes les données"
				danger
				onPress={() => router.push("/settings/danger-zone")}
			/>

			<Text style={styles.version}>
				{APP_INFO.name} · v{APP_INFO.version}
			</Text>
		</ScreenContainer>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				container: {
					gap: SPACING.sm,
					justifyContent: "flex-start",
				},
				version: {
					color: colors.textMuted,
					textAlign: "center",
					fontSize: 12,
					marginTop: "auto",
					paddingTop: SPACING.lg,
				},
			}),
		[colors],
	);
}
