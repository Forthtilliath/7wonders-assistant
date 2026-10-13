import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { CategoryPieChart } from "@/components/stats/CategoryPieChart";
import { StatTile } from "@/components/stats/StatTile";
import { WonderRankingRow } from "@/components/stats/WonderRankingRow";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { CATEGORY_META, EXTENSION_ORDER, getOrderedCategories } from "@/constants/categories";
import type { ThemeColors } from "@/constants/theme";
import { SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { computeBarChartScale } from "@/lib/chartScale";
import { computePlayerStats, computeWonderStats } from "@/lib/stats";
import type { Game, Player } from "@/types/game";

type Props = {
	player: Player;
	/** Historique déjà filtré (par extensions notamment) en amont. */
	games: Game[];
};

/** Bloc de statistiques complet pour un joueur : tuiles, répartition, et ses propres merveilles. */
export function PlayerStatsSection({ player, games }: Props) {
	const colors = useColors();
	const styles = useStyles(colors);
	const stats = useMemo(() => computePlayerStats(player.id, games), [player.id, games]);

	const categories = useMemo(() => {
		const activeExtensions = EXTENSION_ORDER.filter((ext) =>
			games.some((g) => g.playerIds.includes(player.id) && g.extensions.includes(ext)),
		);
		return getOrderedCategories(activeExtensions);
	}, [games, player.id]);

	const chartData = categories.map((category) => ({
		value: Math.round((stats.averageByCategory[category] ?? 0) * 10) / 10,
		label: CATEGORY_META[category].shortLabel,
		frontColor: CATEGORY_META[category].color,
	}));
	const chartScale = computeBarChartScale(chartData.map((d) => d.value));

	const { bestWonders, worstWonders } = useMemo(() => {
		const sorted = [...computeWonderStats(games, player.id)].sort((a, b) => b.winRate - a.winRate);
		return { bestWonders: sorted.slice(0, 5), worstWonders: sorted.slice(-5).reverse() };
	}, [games, player.id]);

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<PlayerAvatar name={player.name} avatarUri={player.avatarUri} seed={player.id} size={36} />
				<Text style={styles.name}>{player.name}</Text>
			</View>

			{stats.gamesPlayed === 0 ? (
				<Text style={styles.empty}>Aucune partie de {player.name} ne correspond à ce filtre.</Text>
			) : (
				<>
					<View style={styles.tilesRow}>
						<StatTile label="Parties jouées" value={String(stats.gamesPlayed)} />
						<StatTile label="Victoires" value={String(stats.wins)} />
						<StatTile label="Taux de victoire" value={`${Math.round(stats.winRate * 100)}%`} />
					</View>
					<View style={styles.tilesRow}>
						<StatTile label="Score moyen" value={String(Math.round(stats.averageTotal))} />
						<StatTile label="Meilleur score" value={String(stats.bestTotal)} />
					</View>

					<SectionTitle>Points moyens par catégorie</SectionTitle>
					<View style={styles.chartWrapper}>
						<BarChart
							data={chartData}
							barWidth={24}
							spacing={18}
							roundedTop
							noOfSections={chartScale.noOfSections}
							noOfSectionsBelowXAxis={chartScale.noOfSectionsBelowXAxis}
							stepValue={chartScale.stepValue}
							maxValue={chartScale.maxValue}
							mostNegativeValue={chartScale.mostNegativeValue}
							yAxisTextStyle={{ color: colors.textMuted }}
							xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 10 }}
							xAxisColor={colors.border}
							yAxisColor={colors.border}
							hideRules
						/>
					</View>

					<SectionTitle>Répartition des points</SectionTitle>
					<CategoryPieChart categories={categories} values={stats.averageByCategory} />

					{bestWonders.length > 0 && (
						<>
							<SectionTitle>Ses meilleures merveilles</SectionTitle>
							<View style={styles.wonderList}>
								{bestWonders.map((wonder, index) => (
									<WonderRankingRow
										key={`${wonder.name}-${wonder.side}`}
										rank={index + 1}
										wonder={wonder}
									/>
								))}
							</View>

							<SectionTitle>Ses pires merveilles</SectionTitle>
							<View style={styles.wonderList}>
								{worstWonders.map((wonder, index) => (
									<WonderRankingRow
										key={`${wonder.name}-${wonder.side}`}
										rank={index + 1}
										wonder={wonder}
									/>
								))}
							</View>
						</>
					)}
				</>
			)}
		</View>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				container: {
					gap: SPACING.md,
				},
				header: {
					flexDirection: "row",
					alignItems: "center",
					gap: SPACING.sm,
				},
				name: {
					color: colors.text,
					fontSize: 18,
					fontWeight: "700",
				},
				tilesRow: {
					flexDirection: "row",
					gap: SPACING.sm,
				},
				chartWrapper: {
					paddingVertical: SPACING.md,
				},
				wonderList: {
					gap: SPACING.xs,
				},
				empty: {
					color: colors.textMuted,
					fontStyle: "italic",
				},
			}),
		[colors],
	);
}
