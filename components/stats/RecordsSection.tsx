import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { ThemeColors } from "@/constants/theme";
import { cardSurface, FONTS, RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import type { GlobalRecords } from "@/lib/stats";
import type { Player } from "@/types/game";

type Props = {
	records: GlobalRecords;
	players: Player[];
};

function formatDate(timestamp: number) {
	return new Date(timestamp).toLocaleDateString("fr-FR");
}

/** Encart des records remarquables de l'historique (filtré), affiché en haut de Statistiques. */
export function RecordsSection({ records, players }: Props) {
	const colors = useColors();
	const styles = useStyles(colors);

	const bestScorePlayer = records.bestScore
		? players.find((p) => p.id === records.bestScore?.playerId)
		: undefined;
	const streakPlayer = records.longestWinStreak
		? players.find((p) => p.id === records.longestWinStreak?.playerId)
		: undefined;

	if (!records.bestScore && !records.longestWinStreak && !records.closestGame) {
		return null;
	}

	return (
		<View style={styles.container}>
			<SectionTitle>Records</SectionTitle>
			<View style={styles.row}>
				{records.bestScore && bestScorePlayer && (
					<View style={styles.card}>
						<MaterialCommunityIcons name="trophy" size={20} color={colors.gold} />
						<Text style={styles.value}>{records.bestScore.total} pts</Text>
						<Text style={styles.label}>Meilleur score</Text>
						<Text style={styles.detail} numberOfLines={1}>
							{bestScorePlayer.name}
						</Text>
					</View>
				)}
				{records.longestWinStreak && streakPlayer && (
					<View style={styles.card}>
						<MaterialCommunityIcons name="fire" size={20} color={colors.gold} />
						<Text style={styles.value}>{records.longestWinStreak.streak}</Text>
						<Text style={styles.label}>Plus longue série</Text>
						<Text style={styles.detail} numberOfLines={1}>
							{streakPlayer.name}
						</Text>
					</View>
				)}
				{records.closestGame && (
					<View style={styles.card}>
						<MaterialCommunityIcons name="sword-cross" size={20} color={colors.gold} />
						<Text style={styles.value}>{records.closestGame.gap} pt(s)</Text>
						<Text style={styles.label}>Partie la plus disputée</Text>
						<Text style={styles.detail} numberOfLines={1}>
							{formatDate(records.closestGame.finishedAt)}
						</Text>
					</View>
				)}
			</View>
		</View>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				container: {
					gap: SPACING.sm,
				},
				row: {
					flexDirection: "row",
					gap: SPACING.sm,
				},
				card: {
					flex: 1,
					minWidth: 90,
					...cardSurface(colors),
					borderRadius: RADIUS.md,
					paddingVertical: SPACING.md,
					paddingHorizontal: SPACING.xs,
					alignItems: "center",
					gap: 2,
				},
				value: {
					color: colors.text,
					fontSize: 18,
					fontFamily: FONTS.displayBold,
					marginTop: 4,
				},
				label: {
					color: colors.textMuted,
					fontSize: 11,
					textAlign: "center",
				},
				detail: {
					color: colors.gold,
					fontSize: 12,
					fontWeight: "700",
					textAlign: "center",
					maxWidth: "100%",
				},
			}),
		[colors],
	);
}
