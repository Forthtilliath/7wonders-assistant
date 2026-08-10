import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { CATEGORY_META } from "@/constants/categories";
import type { ThemeColors } from "@/constants/theme";
import { SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import type { CategoryId } from "@/types/game";

type Props = {
	categories: CategoryId[];
	/** Points par catégorie à répartir (moyenne sur l'historique, ou score d'une seule partie). */
	values: Partial<Record<CategoryId, number>>;
};

/**
 * Répartition (en %) des points par catégorie, pour faire ressortir comment le score se
 * construit. Les catégories à valeur négative ou nulle (ex. militaire déficitaire) sont exclues :
 * une part de camembert négative n'a pas de sens.
 */
export function CategoryPieChart({ categories, values }: Props) {
	const colors = useColors();
	const styles = useStyles(colors);

	const slices = categories
		.map((category) => ({
			category,
			value: Math.max(0, values[category] ?? 0),
		}))
		.filter((slice) => slice.value > 0);

	const total = slices.reduce((sum, slice) => sum + slice.value, 0);

	if (total === 0) {
		return (
			<Text style={styles.empty}>Pas assez de points positifs pour afficher une répartition.</Text>
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
				innerCircleColor={colors.surface}
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

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
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
					color: colors.textMuted,
					fontSize: 12,
				},
				legendValue: {
					color: colors.text,
					fontSize: 12,
					fontWeight: "700",
				},
				empty: {
					color: colors.textMuted,
					fontStyle: "italic",
				},
			}),
		[colors],
	);
}
