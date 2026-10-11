import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import type { ThemeColors } from "@/constants/theme";
import { RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import type { BackupData } from "@/lib/backupSchema";
import {
	cloudErrorMessage,
	connectGoogleDrive,
	connectWithLocalData,
	connectWithRemoteBackup,
	disconnectGoogleDrive,
	fetchCloudBackup,
	restoreFromCloud,
	syncCloudBackupNow,
} from "@/lib/cloudBackup";
import { formatBackupDate, formatDate } from "@/lib/date";
import { useBackupStore } from "@/stores/backupStore";

function describeBackup(data: BackupData): string {
	return `du ${formatDate(data.exportedAt)} (${data.players.length} joueur(s), ${data.history.length} partie(s))`;
}

/** Réglages ▸ Sauvegardes : connexion du compte Google et état de la sauvegarde automatique. */
export function CloudBackupSection() {
	const colors = useColors();
	const styles = useStyles(colors);
	const cloudAccount = useBackupStore((s) => s.cloudAccount);
	const lastCloudBackupAt = useBackupStore((s) => s.lastCloudBackupAt);
	const cloudSyncPending = useBackupStore((s) => s.cloudSyncPending);
	const cloudError = useBackupStore((s) => s.cloudError);
	const [busy, setBusy] = useState(false);

	const run = async (action: () => Promise<void>) => {
		setBusy(true);
		try {
			await action();
		} catch (error) {
			Alert.alert("Erreur", cloudErrorMessage(error));
		} finally {
			setBusy(false);
		}
	};

	const confirmConnected = (email: string) =>
		Alert.alert(
			"Sauvegarde automatique activée",
			`Tes données sont désormais envoyées sur le Google Drive de ${email} après chaque modification.`,
		);

	const askConflictChoice = (email: string, remote: BackupData) => {
		Alert.alert(
			"Une sauvegarde existe déjà",
			`Ce compte Google contient une sauvegarde ${describeBackup(remote)}. Laquelle garder ?`,
			[
				{ text: "Annuler", style: "cancel", onPress: () => void disconnectGoogleDrive() },
				{
					text: "Ce téléphone",
					style: "destructive",
					onPress: () =>
						run(async () => {
							await connectWithLocalData(email);
							confirmConnected(email);
						}),
				},
				{
					text: "Google Drive",
					onPress: () =>
						run(async () => {
							await connectWithRemoteBackup(email, remote);
							confirmConnected(email);
						}),
				},
			],
		);
	};

	const handleConnect = () =>
		run(async () => {
			const result = await connectGoogleDrive();
			if (result.status === "connected") confirmConnected(result.email);
			if (result.status === "conflict") askConflictChoice(result.email, result.remote);
		});

	const handleSyncNow = () =>
		run(async () => {
			const ok = await syncCloudBackupNow();
			if (!ok) {
				Alert.alert("Erreur", useBackupStore.getState().cloudError ?? "L'envoi a échoué.");
			}
		});

	const handleRestore = () =>
		run(async () => {
			const remote = await fetchCloudBackup();
			if (!remote) {
				Alert.alert("Aucune sauvegarde", "Rien n'a encore été envoyé sur Google Drive.");
				return;
			}
			Alert.alert(
				"Restaurer depuis Google Drive ?",
				`Restaure la sauvegarde ${describeBackup(remote)}. Les données actuelles seront remplacées (une sauvegarde de secours est gardée, restaurable via "Annuler le dernier import").`,
				[
					{ text: "Annuler", style: "cancel" },
					{
						text: "Restaurer",
						style: "destructive",
						onPress: () =>
							run(async () => {
								const { players, history, groups } = await restoreFromCloud(remote);
								Alert.alert(
									"Restauré",
									`${players} joueur(s), ${groups} groupe(s) et ${history} partie(s) restaurés.`,
								);
							}),
					},
				],
			);
		});

	const confirmDisconnect = () =>
		Alert.alert(
			"Désactiver la sauvegarde automatique ?",
			"La dernière sauvegarde reste sur ton Google Drive, mais les prochaines parties n'y seront plus envoyées.",
			[
				{ text: "Annuler", style: "cancel" },
				{ text: "Désactiver", style: "destructive", onPress: () => run(disconnectGoogleDrive) },
			],
		);

	if (!cloudAccount) {
		return (
			<View style={styles.card}>
				<Text style={styles.title}>Sauvegarde automatique</Text>
				<Text style={styles.hint}>
					Relie ton compte Google : tes données sont envoyées automatiquement sur ton Google Drive
					(dans un dossier privé réservé à l'app) après chaque partie. Pratique pour changer de
					téléphone sans rien perdre.
				</Text>
				<Button label="Connecter Google Drive" onPress={handleConnect} disabled={busy} />
			</View>
		);
	}

	return (
		<View style={styles.card}>
			<Text style={styles.title}>Sauvegarde automatique</Text>
			<View style={styles.statusRow}>
				<Ionicons name="logo-google" size={16} color={colors.textMuted} />
				<Text style={styles.status}>{cloudAccount.email}</Text>
			</View>
			<View style={styles.statusRow}>
				<Ionicons
					name={cloudError ? "cloud-offline" : "cloud-done"}
					size={16}
					color={cloudError ? colors.danger : colors.success}
				/>
				<Text style={styles.status}>
					Dernier envoi : {formatBackupDate(lastCloudBackupAt)}
					{cloudSyncPending && !cloudError ? " · envoi en cours…" : ""}
				</Text>
			</View>
			{cloudError && <Text style={styles.error}>{cloudError}</Text>}
			<Button
				label="Sauvegarder maintenant"
				variant="secondary"
				onPress={handleSyncNow}
				disabled={busy}
			/>
			<Button
				label="Restaurer depuis Google Drive"
				variant="secondary"
				onPress={handleRestore}
				disabled={busy}
			/>
			<Button label="Déconnecter" variant="ghost" onPress={confirmDisconnect} disabled={busy} />
		</View>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				card: {
					backgroundColor: colors.surface,
					borderRadius: RADIUS.md,
					padding: SPACING.md,
					gap: SPACING.sm,
				},
				title: {
					color: colors.text,
					fontSize: 16,
					fontWeight: "700",
				},
				hint: {
					color: colors.textMuted,
					fontSize: 13,
				},
				statusRow: {
					flexDirection: "row",
					alignItems: "center",
					gap: SPACING.sm,
				},
				status: {
					color: colors.text,
					fontSize: 14,
				},
				error: {
					color: colors.danger,
					fontSize: 13,
				},
			}),
		[colors],
	);
}
