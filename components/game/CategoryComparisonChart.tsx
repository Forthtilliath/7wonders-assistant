import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { getInitials } from "@/components/ui/PlayerAvatar";
import { CATEGORY_META } from "@/constants/categories";
import type { ThemeColors } from "@/constants/theme";
import { SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { getAvatarColor } from "@/lib/avatarColor";
import { computeBarChartScale } from "@/lib/chartScale";
import { getCategoryScore, type RankedPlayerScore } from "@/lib/scoring/total";
import type { CategoryId, Player } from "@/types/game";

type Props = {
	category: CategoryId;
	players: Player[];
	scores: RankedPlayerScore[];
};

/**
 * Barres comparant les joueurs entre eux sur une seule catégorie (score de fin de partie), une
 * couleur par barre dérivée de l'id du joueur pour se repérer d'un coup d'œil (même couleur que
 * son avatar ailleurs dans l'app).
 */
export function CategoryComparisonChart({ category, players, scores }: Props) {
	const colors = useColors();
	const styles = useStyles(colors);
	const meta = CATEGORY_META[category];

	const chartData = players.map((player) => {
		const score = scores.find((s) => s.playerId === player.id);
		return {
			value: score ? getCategoryScore(score, category) : 0,
			label: getInitials(player.name),
			frontColor: getAvatarColor(player.id),
		};
	});
	const chartScale = computeBarChartScale(chartData.map((d) => d.value));

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<MaterialCommunityIcons name={meta.icon} size={16} color={meta.color} />
				<Text style={styles.title}>{meta.label}</Text>
			</View>
			<BarChart
				data={chartData}
				horizontal
				barWidth={28}
				spacing={20}
				roundedTop
				noOfSections={chartScale.noOfSections}
				noOfSectionsBelowXAxis={chartScale.noOfSectionsBelowXAxis}
				stepValue={chartScale.stepValue}
				maxValue={chartScale.maxValue}
				mostNegativeValue={chartScale.mostNegativeValue}
				yAxisTextStyle={{ color: colors.textMuted }}
				xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 11 }}
				xAxisColor={colors.border}
				yAxisColor={colors.border}
				hideRules
			/>
		</View>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				container: {
					gap: SPACING.xs,
				},
				header: {
					flexDirection: "row",
					alignItems: "center",
					gap: 6,
				},
				title: {
					color: colors.text,
					fontSize: 14,
					fontWeight: "700",
				},
			}),
		[colors],
	);
}
