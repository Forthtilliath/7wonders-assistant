import { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { CheckboxGroup } from "@/components/ui/CheckboxGroup";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { APP_INFO } from "@/constants/app";
import { EXTENSION_LABELS, EXTENSION_ORDER } from "@/constants/categories";
import type { ThemeColors } from "@/constants/theme";
import { SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { exportData, exportGamesCsv, importData, restoreSafetyBackup } from "@/lib/backup";
import { ImportError } from "@/lib/backupSchema";
import { useGroupsStore } from "@/stores/groupsStore";
import { useHistoryStore } from "@/stores/historyStore";
import { usePlayersStore } from "@/stores/playersStore";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { type ThemeMode, useThemeStore } from "@/stores/themeStore";
import type { ExtensionId } from "@/types/game";

const EXTENSION_OPTIONS = EXTENSION_ORDER.map((ext) => ({
	value: ext,
	label: EXTENSION_LABELS[ext],
}));

export default function SettingsScreen() {
	const colors = useColors();
	const styles = useStyles(colors);
	const clearPlayers = usePlayersStore((s) => s.replaceAll);
	const clearHistory = useHistoryStore((s) => s.replaceAll);
	const clearGroups = useGroupsStore((s) => s.replaceAll);
	const mode = useThemeStore((s) => s.mode);
	const setMode = useThemeStore((s) => s.setMode);
	const defaultExtensions = usePreferencesStore((s) => s.defaultExtensions);
	const setDefaultExtensions = usePreferencesStore((s) => s.setDefaultExtensions);
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

	const confirmClearData = () => {
		Alert.alert(
			"Effacer toutes les données ?",
			"Tous les joueurs, groupes et tout l'historique de parties seront supprimés définitivement.",
			[
				{ text: "Annuler", style: "cancel" },
				{
					text: "Tout effacer",
					style: "destructive",
					onPress: () => {
						clearPlayers([]);
						clearHistory([]);
						clearGroups([]);
					},
				},
			],
		);
	};

	return (
		<ScreenContainer style={styles.container}>
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Apparence</Text>
				<RadioGroup<ThemeMode>
					options={[
						{ value: "dark", label: "Sombre" },
						{ value: "light", label: "Clair" },
					]}
					value={mode}
					onChange={setMode}
				/>
			</View>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Extensions par défaut</Text>
				<Text style={styles.hint}>
					Pré-cochées automatiquement à la création d'une nouvelle partie.
				</Text>
				<CheckboxGroup<ExtensionId>
					options={EXTENSION_OPTIONS}
					values={defaultExtensions}
					onChange={setDefaultExtensions}
				/>
			</View>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Sauvegarde</Text>
				<Text style={styles.hint}>
					Toutes les données restent sur cet appareil. Exporte un fichier JSON pour la garder en
					sécurité ou la transférer sur un autre téléphone, ou un CSV pour ouvrir les scores dans un
					tableur.
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

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				container: {
					justifyContent: "space-between",
				},
				section: {
					gap: SPACING.sm,
				},
				sectionTitle: {
					color: colors.textMuted,
					fontSize: 14,
					textTransform: "uppercase",
					letterSpacing: 0.5,
				},
				hint: {
					color: colors.textMuted,
					fontSize: 13,
					marginBottom: SPACING.xs,
				},
				version: {
					color: colors.textMuted,
					textAlign: "center",
					fontSize: 12,
				},
			}),
		[colors],
	);
}
