import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { APP_INFO } from "@/constants/app";
import { COLORS, SPACING } from "@/constants/theme";
import { exportData, ImportError, importData } from "@/lib/backup";
import { useHistoryStore } from "@/stores/historyStore";
import { usePlayersStore } from "@/stores/playersStore";

export default function SettingsScreen() {
	const clearPlayers = usePlayersStore((s) => s.replaceAll);
	const clearHistory = useHistoryStore((s) => s.replaceAll);
	const [busy, setBusy] = useState(false);

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

	const handleImport = async () => {
		setBusy(true);
		try {
			const { players, history } = await importData();
			Alert.alert(
				"Import réussi",
				`${players} joueur(s) et ${history} partie(s) chargés. Les données précédentes ont été remplacées.`,
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

	const confirmClearData = () => {
		Alert.alert(
			"Effacer toutes les données ?",
			"Tous les joueurs et tout l'historique de parties seront supprimés définitivement.",
			[
				{ text: "Annuler", style: "cancel" },
				{
					text: "Tout effacer",
					style: "destructive",
					onPress: () => {
						clearPlayers([]);
						clearHistory([]);
					},
				},
			],
		);
	};

	return (
		<ScreenContainer style={styles.container}>
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Sauvegarde</Text>
				<Text style={styles.hint}>
					Toutes les données restent sur cet appareil. Exporte un fichier JSON pour la garder en
					sécurité ou la transférer sur un autre téléphone.
				</Text>
				<Button label="Exporter les données" onPress={handleExport} disabled={busy} />
				<Button
					label="Importer une sauvegarde"
					variant="secondary"
					onPress={handleImport}
					disabled={busy}
				/>
			</View>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Zone dangereuse</Text>
				<Button label="Effacer toutes les données" variant="danger" onPress={confirmClearData} />
			</View>

			<Text style={styles.version}>
				{APP_INFO.name} · v{APP_INFO.version}
			</Text>
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	container: {
		justifyContent: "space-between",
	},
	section: {
		gap: SPACING.sm,
	},
	sectionTitle: {
		color: COLORS.textMuted,
		fontSize: 14,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	hint: {
		color: COLORS.textMuted,
		fontSize: 13,
		marginBottom: SPACING.xs,
	},
	version: {
		color: COLORS.textMuted,
		textAlign: "center",
		fontSize: 12,
	},
});
