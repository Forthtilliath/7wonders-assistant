import { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { CloudBackupSection } from "@/components/backup/CloudBackupSection";
import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import type { ThemeColors } from "@/constants/theme";
import { SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { exportData, exportGamesCsv, importData, restoreSafetyBackup } from "@/lib/backup";
import { ImportError } from "@/lib/backupSchema";
import { formatBackupDate } from "@/lib/date";
import { useBackupStore } from "@/stores/backupStore";

export default function BackupSettingsScreen() {
	const colors = useColors();
	const styles = useStyles(colors);
	const [busy, setBusy] = useState(false);
	const lastBackupAt = useBackupStore((s) => s.lastBackupAt);

	const handleExport = async () => {
		setBusy(true);
		try {
			await exportData();
		} catch {
			Alert.alert("Erreur", "L'export a échoué.");
		} finally {
			setBusy(false);
		}
	};

	const handleExportCsv = async () => {
		setBusy(true);
		try {
			await exportGamesCsv();
		} catch {
			Alert.alert("Erreur", "L'export CSV a échoué.");
		} finally {
			setBusy(false);
		}
	};

	const handleImport = async () => {
		setBusy(true);
		try {
			const { players, history, groups } = await importData();
			Alert.alert(
				"Import réussi",
				`${players} joueur(s), ${groups} groupe(s) et ${history} partie(s) chargés. Les données ` +
					"précédentes ont été remplacées (une sauvegarde de secours a été gardée, restaurable " +
					'via "Annuler le dernier import" si besoin).',
			);
		} catch (error) {
			if (error instanceof ImportError) {
				Alert.alert("Import annulé", error.message);
			} else {
				Alert.alert("Erreur", "L'import a échoué.");
			}
		} finally {
			setBusy(false);
		}
	};

	const confirmRestoreSafetyBackup = () => {
		Alert.alert(
			"Annuler le dernier import ?",
			"Restaure les données telles qu'elles étaient juste avant le dernier import effectué sur cet appareil. Ce qui a été fait depuis sera perdu.",
			[
				{ text: "Annuler", style: "cancel" },
				{
					text: "Restaurer",
					style: "destructive",
					onPress: async () => {
						setBusy(true);
						try {
							const { players, history, groups } = await restoreSafetyBackup();
							Alert.alert(
								"Restauré",
								`${players} joueur(s), ${groups} groupe(s) et ${history} partie(s) restaurés.`,
							);
						} catch (error) {
							Alert.alert(
								"Erreur",
								error instanceof ImportError ? error.message : "La restauration a échoué.",
							);
						} finally {
							setBusy(false);
						}
					},
				},
			],
		);
	};

	return (
		<ScreenContainer>
			<ScrollView contentContainerStyle={styles.container}>
				<CloudBackupSection />
				<Text style={styles.sectionTitle}>Sauvegarde manuelle</Text>
				<Text style={styles.hint}>
					Exporte un fichier JSON pour garder tes données en sécurité ou les transférer sur un autre
					téléphone, ou un CSV pour ouvrir les scores dans un tableur. Dernière sauvegarde :{" "}
					{formatBackupDate(lastBackupAt)}.
				</Text>
				<Button label="Exporter les données" onPress={handleExport} disabled={busy} />
				<Button
					label="Exporter les scores en CSV"
					variant="secondary"
					onPress={handleExportCsv}
					disabled={busy}
				/>
				<Button
					label="Importer une sauvegarde"
					variant="secondary"
					onPress={handleImport}
					disabled={busy}
				/>
				<Button
					label="Annuler le dernier import"
					variant="ghost"
					onPress={confirmRestoreSafetyBackup}
					disabled={busy}
				/>
			</ScrollView>
		</ScreenContainer>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				container: {
					gap: SPACING.sm,
					paddingBottom: SPACING.md,
				},
				sectionTitle: {
					color: colors.textMuted,
					fontSize: 14,
					textTransform: "uppercase",
					letterSpacing: 0.5,
					marginTop: SPACING.md,
				},
				hint: {
					color: colors.textMuted,
					fontSize: 13,
					marginBottom: SPACING.xs,
				},
			}),
		[colors],
	);
}
