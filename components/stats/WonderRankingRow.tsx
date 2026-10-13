import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { ThemeColors } from "@/constants/theme";
import { cardSurface, FONTS, RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import type { WonderStats } from "@/lib/stats";

type Props = {
	rank: number;
	wonder: WonderStats;
};

export function WonderRankingRow({ rank, wonder }: Props) {
	const colors = useColors();
	const styles = useStyles(colors);

	return (
		<View style={styles.row}>
			<Text style={styles.rank}>{rank}</Text>
			<View style={styles.info}>
				<Text style={styles.name} numberOfLines={1}>
					{wonder.name}
					{wonder.side ? ` (Face ${wonder.side})` : ""}
				</Text>
				<Text style={styles.meta}>
					{wonder.timesPlayed} partie(s) · {wonder.averageTotal.toFixed(1)} pts en moyenne
				</Text>
			</View>
			<Text style={styles.winRate}>{Math.round(wonder.winRate * 100)}%</Text>
		</View>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				row: {
					flexDirection: "row",
					alignItems: "center",
					gap: SPACING.sm,
					...cardSurface(colors),
					borderRadius: RADIUS.md,
					padding: SPACING.sm,
				},
				rank: {
					width: 24,
					textAlign: "center",
					color: colors.textMuted,
					fontWeight: "700",
				},
				info: {
					flex: 1,
				},
				name: {
					color: colors.text,
					fontWeight: "600",
				},
				meta: {
					color: colors.textMuted,
					fontSize: 12,
				},
				winRate: {
					color: colors.gold,
					fontFamily: FONTS.displayBold,
					fontSize: 16,
				},
			}),
		[colors],
	);
}
