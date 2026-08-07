import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { CATEGORY_META } from "@/constants/categories";
import { COLORS, SPACING } from "@/constants/theme";
import type { PlayerStats } from "@/lib/stats";
import type { CategoryId } from "@/types/game";

type Props = {
	categories: CategoryId[];
	stats: PlayerStats;
};

/**
 * Répartition (en %) des points moyens par catégorie, pour faire ressortir comment le joueur
 * gagne ses points. Les catégories à moyenne négative ou nulle (ex. militaire déficitaire) sont
 * exclues : une part de camembert négative n'a pas de sens.
 */
export function CategoryPieChart({ categories, stats }: Props) {
	const slices = categories
		.map((category) => ({
			category,
			value: Math.max(0, stats.averageByCategory[category] ?? 0),
		}))
		.filter((slice) => slice.value > 0);

	const total = slices.reduce((sum, slice) => sum + slice.value, 0);

	if (total === 0) {
		return (
			<Text style={styles.empty}>
				Pas assez de points positifs en moyenne pour afficher une répartition.
			</Text>
		);
	}

	const pieData = slices.map((slice) => ({
		value: slice.value,
		color: CATEGORY_META[slice.category].color,
	}));

	return (
		<View style={styles.row}>
			<PieChart
				data={pieData}
				radius={70}
				donut
				innerRadius={36}
				innerCircleColor={COLORS.surface}
			/>
			<View style={styles.legend}>
				{slices.map((slice) => (
					<View key={slice.category} style={styles.legendRow}>
						<MaterialCommunityIcons
							name={CATEGORY_META[slice.category].icon}
							size={14}
							color={CATEGORY_META[slice.category].color}
						/>
						<Text style={styles.legendLabel} numberOfLines={1}>
							{CATEGORY_META[slice.category].shortLabel}
						</Text>
						<Text style={styles.legendValue}>{Math.round((slice.value / total) * 100)}%</Text>
					</View>
				))}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: SPACING.lg,
	},
	legend: {
		flex: 1,
		gap: 6,
	},
	legendRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	legendLabel: {
		flex: 1,
		color: COLORS.textMuted,
		fontSize: 12,
	},
	legendValue: {
		color: COLORS.text,
		fontSize: 12,
		fontWeight: "700",
	},
	empty: {
		color: COLORS.textMuted,
		fontStyle: "italic",
	},
});
