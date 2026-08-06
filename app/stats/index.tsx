import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { SelectablePlayerCard } from "@/components/players/SelectablePlayerCard";
import { StatTile } from "@/components/stats/StatTile";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { BASE_CATEGORY_ORDER, CATEGORY_META, EXTENSION_ORDER } from "@/constants/categories";
import { COLORS, SPACING } from "@/constants/theme";
import { computePlayerStats } from "@/lib/stats";
import { useHistoryStore } from "@/stores/historyStore";
import { usePlayersStore } from "@/stores/playersStore";

export default function StatsScreen() {
	const players = usePlayersStore((s) => s.players);
	const games = useHistoryStore((s) => s.games);

	const playersWithGames = players.filter((p) => games.some((g) => g.playerIds.includes(p.id)));
	const [selectedId, setSelectedId] = useState<string | undefined>(playersWithGames[0]?.id);
	const selectedPlayer = playersWithGames.find((p) => p.id === selectedId);

	const stats = useMemo(
		() => (selectedPlayer ? computePlayerStats(selectedPlayer.id, games) : null),
		[selectedPlayer, games],
	);

	if (playersWithGames.length === 0) {
		return (
			<ScreenContainer>
				<Text style={styles.empty}>
					Aucune statistique disponible : termine une partie pour voir apparaître les premières
					données.
				</Text>
			</ScreenContainer>
		);
	}

	const categories = selectedPlayer
		? [
				...BASE_CATEGORY_ORDER,
				...EXTENSION_ORDER.filter((ext) =>
					games.some((g) => g.playerIds.includes(selectedPlayer.id) && g.extensions.includes(ext)),
				),
			]
		: [];

	const chartData = categories.map((category) => ({
		value: Math.round((stats?.averageByCategory[category] ?? 0) * 10) / 10,
		label: CATEGORY_META[category].shortLabel,
		frontColor: CATEGORY_META[category].color,
	}));

	return (
		<ScreenContainer>
			<ScrollView contentContainerStyle={styles.content}>
				<View style={styles.playerRow}>
					{playersWithGames.map((player) => (
						<SelectablePlayerCard
							key={player.id}
							name={player.name}
							avatarUri={player.avatarUri}
							selected={player.id === selectedId}
							onPress={() => setSelectedId(player.id)}
						/>
					))}
				</View>

				{stats && (
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

						<Text style={styles.sectionTitle}>Points moyens par catégorie</Text>
						<View style={styles.chartWrapper}>
							<BarChart
								data={chartData}
								barWidth={24}
								spacing={18}
								roundedTop
								noOfSections={4}
								yAxisTextStyle={{ color: COLORS.textMuted }}
								xAxisLabelTextStyle={{ color: COLORS.textMuted, fontSize: 10 }}
								xAxisColor={COLORS.border}
								yAxisColor={COLORS.border}
								hideRules
							/>
						</View>
					</>
				)}
			</ScrollView>
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	content: {
		gap: SPACING.md,
		paddingBottom: SPACING.md,
	},
	playerRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: SPACING.sm,
	},
	tilesRow: {
		flexDirection: "row",
		gap: SPACING.sm,
	},
	sectionTitle: {
		color: COLORS.textMuted,
		fontSize: 14,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	chartWrapper: {
		paddingVertical: SPACING.md,
	},
	empty: {
		color: COLORS.textMuted,
		textAlign: "center",
		marginTop: SPACING.xl,
	},
});
