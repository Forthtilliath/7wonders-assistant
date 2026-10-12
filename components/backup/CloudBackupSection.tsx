import { useState } from "react";
import { Alert } from "react-native";
import {
	SettingsCard,
	SettingsCardHint,
	SettingsCardStatus,
} from "@/components/settings/SettingsCard";
import { Button } from "@/components/ui/Button";
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
			<SettingsCard icon="cloud-upload-outline" title="Sauvegarde automatique">
				<SettingsCardHint>
					Relie ton compte Google : tes données sont envoyées automatiquement sur ton Google Drive
					(dans un dossier privé réservé à l'app) après chaque partie. Pratique pour changer de
					téléphone sans rien perdre.
				</SettingsCardHint>
				<Button label="Connecter Google Drive" onPress={handleConnect} disabled={busy} />
			</SettingsCard>
		);
	}

	return (
		<SettingsCard icon="cloud-upload-outline" title="Sauvegarde automatique">
			<SettingsCardStatus icon="logo-google">{cloudAccount.email}</SettingsCardStatus>
			<SettingsCardStatus
				icon={cloudError ? "cloud-offline" : "cloud-done"}
				color={cloudError ? colors.danger : colors.success}
			>
				Dernier envoi : {formatBackupDate(lastCloudBackupAt)}
				{cloudSyncPending && !cloudError ? " · envoi en cours…" : ""}
			</SettingsCardStatus>
			{cloudError && (
				<SettingsCardStatus icon="alert-circle" color={colors.danger}>
					{cloudError}
				</SettingsCardStatus>
			)}
			<SettingsCardHint>Envoi automatique après chaque modification.</SettingsCardHint>
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
		</SettingsCard>
	);
}
