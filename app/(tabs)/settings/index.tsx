import { useBackupState } from "@forthtilliath/expo-backup-ui/hooks";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, Text } from "react-native";
import { SettingsRow } from "@/components/settings/SettingsRow";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { APP_INFO } from "@/constants/app";
import { EXTENSION_LABELS } from "@/constants/categories";
import { CHANGELOG } from "@/constants/changelog";
import { EDITION_LABELS } from "@/constants/editions";
import type { ThemeColors } from "@/constants/theme";
import { SPACING } from "@/constants/theme";
import { OFFICIAL_WONDERS } from "@/constants/wonders";
import { useColors } from "@/hooks/useColors";
import { backup } from "@/lib/backup";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { useThemeStore } from "@/stores/themeStore";
import { useWondersStore } from "@/stores/wondersStore";

export default function SettingsScreen() {
	const colors = useColors();
	const styles = useStyles(colors);
	const router = useRouter();
	const mode = useThemeStore((s) => s.mode);
	const defaultExtensions = usePreferencesStore((s) => s.defaultExtensions);
	const defaultEdition = usePreferencesStore((s) => s.defaultEdition);
	const cloudConnected = useBackupState(backup).cloudAccount != null;
	const customWonderCount = useWondersStore((s) => s.customWonders.length);
	const packs = useWondersStore((s) => s.packs);
	const packCount = packs.length;

	const defaultExtensionsPreview = [
		EDITION_LABELS[defaultEdition],
		...(defaultExtensions.length > 0
			? defaultExtensions.map((ext) => EXTENSION_LABELS[ext])
			: ["aucune extension"]),
		...packs.filter((p) => p.selectedByDefault).map((p) => p.name),
	].join(", ");
	const wondersPreview = [
		`${OFFICIAL_WONDERS.length} officielles`,
		...(customWonderCount > 0 ? [`${customWonderCount} perso`] : []),
		...(packCount > 0 ? [`${packCount} extension(s) non officielle(s)`] : []),
	].join(", ");

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
				label="Édition et extensions"
				value={defaultExtensionsPreview}
				onPress={() => router.push("/settings/new-game")}
			/>
			<SettingsRow
				icon="business"
				label="Merveilles"
				value={wondersPreview}
				onPress={() => router.push("/settings/wonders")}
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
				icon="sparkles"
				label="Nouveautés"
				value={`Version ${CHANGELOG[0].version}`}
				onPress={() => router.push("/settings/changelog")}
			/>
			<SettingsRow
				icon="heart"
				label="Dons"
				value="Soutenir le projet"
				onPress={() => router.push("/settings/donate")}
			/>
			<SettingsRow
				icon="information-circle"
				label="À propos"
				value="Mises à jour, infos"
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
