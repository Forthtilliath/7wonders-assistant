import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { FiltersSheet } from "@/components/stats/FiltersSheet";
import { PlayerStatsSection } from "@/components/stats/PlayerStatsSection";
import { ScoreTable } from "@/components/stats/ScoreTable";
import { WonderRankingRow } from "@/components/stats/WonderRankingRow";
import { Button } from "@/components/ui/Button";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import {
	BASE_CATEGORY_ORDER,
	EXTENSION_ORDER,
	getExtensionCategories,
} from "@/constants/categories";
import type { ThemeColors } from "@/constants/theme";
import { SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { type ExtensionFilter, filterGamesByExtension } from "@/lib/gameFilters";
import { computePlayerStats, computeWonderStats } from "@/lib/stats";
import { useHistoryStore } from "@/stores/historyStore";
import { usePlayersStore } from "@/stores/playersStore";

type ViewMode = "graph" | "table";
type PickerTarget = null | "playerA" | "playerB" | "extensionsOnly";

export default function StatsScreen() {
	const colors = useColors();
	const styles = useStyles(colors);
	const players = usePlayersStore((s) => s.players);
	const games = useHistoryStore((s) => s.games);

	const [viewMode, setViewMode] = useState<ViewMode>("graph");
	const [extensionFilter, setExtensionFilter] = useState<ExtensionFilter>([]);
	const [selectedId, setSelectedId] = useState<string | undefined>();
	const [compareId, setCompareId] = useState<string | undefined>();
	const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);

	const filteredGames = useMemo(
		() => filterGamesByExtension(games, extensionFilter),
		[games, extensionFilter],
	);

	const playersWithGames = players.filter((p) =>
		filteredGames.some((g) => g.playerIds.includes(p.id)),
	);

	const allCategories = useMemo(() => {
		const activeExtensions = EXTENSION_ORDER.filter((ext) =>
			filteredGames.some((g) => g.extensions.includes(ext)),
		);
		return [...BASE_CATEGORY_ORDER, ...getExtensionCategories(activeExtensions)];
	}, [filteredGames]);

	const statsByPlayerId = useMemo(
		() =>
			Object.fromEntries(
				playersWithGames.map((p) => [p.id, computePlayerStats(p.id, filteredGames)]),
			),
		[playersWithGames, filteredGames],
	);

	// Classement global, avec le filtre d'extensions courant, par taux de victoire.
	const { bestWonders, worstWonders } = useMemo(() => {
		const sorted = [...computeWonderStats(filteredGames)].sort((a, b) => b.winRate - a.winRate);
		return { bestWonders: sorted.slice(0, 5), worstWonders: sorted.slice(-5).reverse() };
	}, [filteredGames]);

	const selectedPlayer = playersWithGames.find((p) => p.id === selectedId);
	const comparePlayer = playersWithGames.find((p) => p.id === compareId);

	const pickerPlayers = pickerTarget === "extensionsOnly" ? undefined : playersWithGames;
	const pickerSelectedId = pickerTarget === "playerB" ? compareId : selectedId;
	const handlePickerSelectPlayer = (id: string) => {
		if (pickerTarget === "playerB") setCompareId(id);
		else setSelectedId(id);
	};

	if (games.length === 0) {
		return (
			<ScreenContainer>
				<Text style={styles.empty}>
					Aucune statistique disponible : termine une partie pour voir apparaître les premières
					données.
				</Text>
			</ScreenContainer>
		);
	}

	return (
		<ScreenContainer>
			<RadioGroup
				options={[
					{ value: "graph", label: "Graphique" },
					{ value: "table", label: "Tableau" },
				]}
				value={viewMode}
				onChange={setViewMode}
			/>

			<ScrollView contentContainerStyle={styles.content}>
				<Button
					label={extensionFilter.length > 0 ? `Filtres (${extensionFilter.length})` : "Filtres"}
					variant="ghost"
					onPress={() => setPickerTarget(viewMode === "table" ? "extensionsOnly" : "playerA")}
				/>

				{playersWithGames.length === 0 ? (
					<Text style={styles.empty}>Aucune partie ne correspond à ce filtre.</Text>
				) : viewMode === "table" ? (
					<>
						<Text style={styles.sectionTitle}>Moyenne de points par catégorie</Text>
						<ScoreTable
							players={playersWithGames}
							categories={allCategories}
							statsByPlayerId={statsByPlayerId}
						/>
					</>
				) : selectedPlayer ? (
					<>
						<PlayerStatsSection player={selectedPlayer} games={filteredGames} />

						{comparePlayer ? (
							<>
								<Button
									label="Retirer la comparaison"
									variant="ghost"
									onPress={() => setCompareId(undefined)}
								/>
								<View style={styles.divider} />
								<PlayerStatsSection player={comparePlayer} games={filteredGames} />
							</>
						) : (
							<Button
								label="Comparer avec..."
								variant="secondary"
								onPress={() => setPickerTarget("playerB")}
							/>
						)}
					</>
				) : (
					<Text style={styles.empty}>
						Choisis un joueur (bouton "Filtres") pour voir ses statistiques.
					</Text>
				)}

				{bestWonders.length > 0 && (
					<>
						<Text style={styles.sectionTitle}>Top 5 des meilleures merveilles</Text>
						<View style={styles.wonderList}>
							{bestWonders.map((wonder, index) => (
								<WonderRankingRow
									key={`${wonder.name}-${wonder.side}`}
									rank={index + 1}
									wonder={wonder}
								/>
							))}
						</View>

						<Text style={styles.sectionTitle}>Top 5 des pires merveilles</Text>
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
			</ScrollView>

			<FiltersSheet
				visible={pickerTarget !== null}
				onClose={() => setPickerTarget(null)}
				extensionFilter={extensionFilter}
				onChangeExtensionFilter={setExtensionFilter}
				players={pickerPlayers}
				selectedPlayerId={pickerSelectedId}
				onSelectPlayer={handlePickerSelectPlayer}
				playerSectionTitle={pickerTarget === "playerB" ? "Comparer avec" : "Joueur"}
			/>
		</ScreenContainer>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				content: {
					gap: SPACING.md,
					paddingTop: SPACING.md,
					paddingBottom: SPACING.md,
				},
				divider: {
					height: 1,
					backgroundColor: colors.border,
					marginVertical: SPACING.sm,
				},
				sectionTitle: {
					color: colors.textMuted,
					fontSize: 14,
					textTransform: "uppercase",
					letterSpacing: 0.5,
				},
				wonderList: {
					gap: SPACING.xs,
				},
				empty: {
					color: colors.textMuted,
					textAlign: "center",
					marginTop: SPACING.xl,
				},
			}),
		[colors],
	);
}
