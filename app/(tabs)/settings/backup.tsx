import { useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { CloudBackupSection } from "@/components/backup/CloudBackupSection";
import {
	SettingsCard,
	SettingsCardHint,
	SettingsCardStatus,
} from "@/components/settings/SettingsCard";
import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SPACING } from "@/constants/theme";
import { exportData, exportGamesCsv, importData, restoreSafetyBackup } from "@/lib/backup";
import { ImportError } from "@/lib/backupSchema";
import { formatBackupDate } from "@/lib/date";
import { useBackupStore } from "@/stores/backupStore";

export default function BackupSettingsScreen() {
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
				<SettingsCard icon="document-text-outline" title="Sauvegarde manuelle">
					<SettingsCardStatus icon="time-outline">
						Dernière sauvegarde : {formatBackupDate(lastBackupAt)}
					</SettingsCardStatus>
					<SettingsCardHint>
						Un fichier JSON pour changer de téléphone, ou un CSV pour ouvrir les scores dans un
						tableur.
					</SettingsCardHint>
					<Button
						label="Exporter les données"
						variant="secondary"
						onPress={handleExport}
						disabled={busy}
					/>
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
				</SettingsCard>
			</ScrollView>
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	container: {
		gap: SPACING.md,
		paddingBottom: SPACING.md,
	},
});
