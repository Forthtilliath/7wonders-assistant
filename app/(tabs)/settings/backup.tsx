import { BackupScreen, type BackupScreenStyles } from "@forthtilliath/expo-backup-ui";
import { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { SettingsCard, SettingsCardHint } from "@/components/settings/SettingsCard";
import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import type { ThemeColors } from "@/constants/theme";
import { cardSurface, RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { backup, describeBackup, exportGamesCsv } from "@/lib/backup";

export default function BackupSettingsScreen() {
	const colors = useColors();
	const backupStyles = useBackupScreenStyles(colors);
	const [exportingCsv, setExportingCsv] = useState(false);

	const handleExportCsv = async () => {
		setExportingCsv(true);
		try {
			await exportGamesCsv();
		} catch {
			Alert.alert("Erreur", "L'export CSV a échoué.");
		} finally {
			setExportingCsv(false);
		}
	};

	return (
		<ScreenContainer>
			<ScrollView contentContainerStyle={styles.container}>
				<BackupScreen manager={backup} describeBackup={describeBackup} styles={backupStyles} />
				<SettingsCard icon="grid-outline" title="Scores en CSV">
					<SettingsCardHint>
						Toutes les parties, une ligne par joueur, à ouvrir dans un tableur. Ce n'est pas une
						sauvegarde : il ne peut pas être réimporté.
					</SettingsCardHint>
					<Button
						label="Exporter les scores en CSV"
						variant="secondary"
						onPress={handleExportCsv}
						disabled={exportingCsv}
					/>
				</SettingsCard>
			</ScrollView>
		</ScreenContainer>
	);
}

/** Couleurs de l'app sur l'écran partagé d'expo-backup-ui (cartes comme `SettingsCard`). */
function useBackupScreenStyles(colors: ThemeColors): BackupScreenStyles {
	return useMemo(
		() => ({
			container: { gap: SPACING.md },
			section: {
				...cardSurface(colors),
				borderRadius: RADIUS.md,
				padding: SPACING.md,
				gap: SPACING.sm,
			},
			sectionTitle: { color: colors.text },
			hint: { color: colors.textMuted },
			status: { color: colors.text },
			errorText: { color: colors.danger },
			button: { backgroundColor: colors.primary, borderRadius: RADIUS.sm },
			buttonText: { color: colors.primaryText },
			secondaryButton: { borderColor: colors.primary },
			secondaryButtonText: { color: colors.primary },
			ghostButtonText: { color: colors.textMuted },
			switchLabel: { color: colors.text },
			modalCard: { backgroundColor: colors.surface, borderRadius: RADIUS.md },
			recoveryCode: { color: colors.text },
			input: { borderColor: colors.border, color: colors.text },
			placeholderTextColor: colors.textMuted,
		}),
		[colors],
	);
}

const styles = StyleSheet.create({
	container: {
		gap: SPACING.md,
		paddingBottom: SPACING.md,
	},
});
