import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ThemeColors } from "@/constants/theme";
import { RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { getUnsavedGames, shouldShowBackupReminder, snoozeUntil } from "@/lib/backupReminder";
import { useBackupStore } from "@/stores/backupStore";
import { useHistoryStore } from "@/stores/historyStore";

/**
 * Rappel discret de sauvegarde : les données sont locales, un changement de téléphone sans
 * sauvegarde perd tout l'historique. Masqué tant que la sauvegarde automatique Google Drive suit
 * les parties, ou pendant quelques jours après "Plus tard".
 */
export function BackupReminderBanner() {
	const router = useRouter();
	const colors = useColors();
	const styles = useStyles(colors);
	const games = useHistoryStore((s) => s.games);
	const lastBackupAt = useBackupStore((s) => s.lastBackupAt);
	const snoozedUntil = useBackupStore((s) => s.reminderSnoozedUntil);
	const cloudConnected = useBackupStore((s) => s.cloudAccount != null);
	const snoozeReminder = useBackupStore((s) => s.snoozeReminder);

	const now = Date.now();
	if (!shouldShowBackupReminder({ games, lastBackupAt, snoozedUntil, now })) return null;

	const unsavedCount = getUnsavedGames(games, lastBackupAt).length;
	const message = cloudConnected
		? "La sauvegarde automatique sur Google Drive n'a pas pu se faire depuis un moment."
		: "Exporte une sauvegarde ou active la sauvegarde automatique Google Drive pour ne rien perdre en changeant de téléphone.";

	return (
		<View style={styles.banner}>
			<View style={styles.header}>
				<Ionicons name="cloud-upload-outline" size={20} color={colors.gold} />
				<Text style={styles.title}>
					{unsavedCount} partie{unsavedCount > 1 ? "s" : ""} non sauvegardée
					{unsavedCount > 1 ? "s" : ""}
				</Text>
			</View>
			<Text style={styles.message}>{message}</Text>
			<View style={styles.actions}>
				<Pressable
					onPress={() => snoozeReminder(snoozeUntil(now))}
					hitSlop={8}
					accessibilityRole="button"
				>
					<Text style={styles.secondaryAction}>Plus tard</Text>
				</Pressable>
				<Pressable
					onPress={() => router.push("/settings/backup")}
					hitSlop={8}
					accessibilityRole="button"
				>
					<Text style={styles.primaryAction}>Sauvegarder</Text>
				</Pressable>
			</View>
		</View>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				banner: {
					backgroundColor: colors.surface,
					borderRadius: RADIUS.md,
					borderWidth: 1,
					borderColor: colors.gold,
					padding: SPACING.md,
					gap: SPACING.xs,
				},
				header: {
					flexDirection: "row",
					alignItems: "center",
					gap: SPACING.sm,
				},
				title: {
					color: colors.text,
					fontSize: 15,
					fontWeight: "700",
				},
				message: {
					color: colors.textMuted,
					fontSize: 13,
				},
				actions: {
					flexDirection: "row",
					justifyContent: "flex-end",
					gap: SPACING.lg,
					marginTop: SPACING.xs,
				},
				secondaryAction: {
					color: colors.textMuted,
					fontWeight: "600",
				},
				primaryAction: {
					color: colors.primary,
					fontWeight: "700",
				},
			}),
		[colors],
	);
}
