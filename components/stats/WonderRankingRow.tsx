import { StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import type { WonderStats } from "@/lib/stats";

type Props = {
	rank: number;
	wonder: WonderStats;
};

export function WonderRankingRow({ rank, wonder }: Props) {
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

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: SPACING.sm,
		backgroundColor: COLORS.surface,
		borderRadius: RADIUS.md,
		padding: SPACING.sm,
	},
	rank: {
		width: 24,
		textAlign: "center",
		color: COLORS.textMuted,
		fontWeight: "700",
	},
	info: {
		flex: 1,
	},
	name: {
		color: COLORS.text,
		fontWeight: "600",
	},
	meta: {
		color: COLORS.textMuted,
		fontSize: 12,
	},
	winRate: {
		color: COLORS.gold,
		fontWeight: "800",
		fontSize: 16,
	},
});
