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
import { usePreferencesStore } from "@/stores/preferencesStore";
import { useThemeStore } from "@/stores/themeStore";

export default function SettingsScreen() {
	const colors = useColors();
	const styles = useStyles(colors);
	const router = useRouter();
	const mode = useThemeStore((s) => s.mode);
	const defaultExtensions = usePreferencesStore((s) => s.defaultExtensions);

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
				label="Nouvelle partie"
				value={defaultExtensionsPreview}
				onPress={() => router.push("/settings/new-game")}
			/>
			<SettingsRow
				icon="cloud-upload"
				label="Sauvegarde"
				value="Export, import, CSV"
				onPress={() => router.push("/settings/backup")}
			/>
			<SettingsRow
				icon="warning"
				label="Zone dangereuse"
				danger
				onPress={() => router.push("/settings/danger-zone")}
			/>
			<SettingsRow
				icon="information-circle"
				label="À propos"
				value="Dons, nouveautés, infos"
				onPress={() => router.push("/settings/about")}
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
