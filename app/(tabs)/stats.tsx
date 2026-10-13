import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { FiltersSheet } from "@/components/stats/FiltersSheet";
import { PlayerStatsSection } from "@/components/stats/PlayerStatsSection";
import { PlayerWinRateRow } from "@/components/stats/PlayerWinRateRow";
import { RecordsSection } from "@/components/stats/RecordsSection";
import { ScoreTable } from "@/components/stats/ScoreTable";
import { WonderRankingRow } from "@/components/stats/WonderRankingRow";
import { Button } from "@/components/ui/Button";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { EXTENSION_ORDER, getOrderedCategories } from "@/constants/categories";
import type { ThemeColors } from "@/constants/theme";
import { SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { type ExtensionFilter, filterGamesByExtension } from "@/lib/gameFilters";
import {
	computeGlobalRecords,
	computePlayerLeaderboard,
	computePlayerStats,
	computeWonderStats,
} from "@/lib/stats";
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
		return getOrderedCategories(activeExtensions);
	}, [filteredGames]);

	const records = useMemo(() => computeGlobalRecords(filteredGames), [filteredGames]);
	const leaderboard = useMemo(
		() => computePlayerLeaderboard(filteredGames, playersWithGames),
		[filteredGames, playersWithGames],
	);

	// Uniquement nécessaire en vue tableau (ScoreTable) : évite de recalculer les stats de tous les
	// joueurs à chaque rendu de la vue graphique, qui ne s'en sert pas (PlayerStatsSection calcule
	// les siennes séparément, pour le seul joueur affiché).
	const statsByPlayerId = useMemo(() => {
		if (viewMode !== "table") return {};
		return Object.fromEntries(
			playersWithGames.map((p) => [p.id, computePlayerStats(p.id, filteredGames)]),
		);
	}, [viewMode, playersWithGames, filteredGames]);

	// Classement global, avec le filtre d'extensions courant, par taux de victoire.
	const { bestWonders, worstWonders } = useMemo(() => {
		const sorted = [...computeWonderStats(filteredGames)].sort((a, b) => b.winRate - a.winRate);
		return { bestWonders: sorted.slice(0, 5), worstWonders: sorted.slice(-5).reverse() };
	}, [filteredGames]);

	const selectedPlayer = playersWithGames.find((p) => p.id === selectedId);
	const comparePlayer = playersWithGames.find((p) => p.id === compareId);

	// Si le filtre d'extensions change et que le joueur choisi n'a plus de partie correspondante, on
	// réinitialise la sélection plutôt que de la laisser pointer vers un joueur qui n'apparaît plus
	// nulle part à l'écran.
	useEffect(() => {
		if (selectedId && !playersWithGames.some((p) => p.id === selectedId)) {
			setSelectedId(undefined);
		}
	}, [selectedId, playersWithGames]);

	useEffect(() => {
		if (compareId && !playersWithGames.some((p) => p.id === compareId)) {
			setCompareId(undefined);
		}
	}, [compareId, playersWithGames]);

	// Pour "Comparer avec...", on exclut le joueur déjà sélectionné : le comparer à lui-même
	// afficherait deux fois les mêmes statistiques côte à côte.
	const pickerPlayers =
		pickerTarget === "extensionsOnly"
			? undefined
			: pickerTarget === "playerB"
				? playersWithGames.filter((p) => p.id !== selectedId)
				: playersWithGames;
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
					<View style={styles.emptyFilterState}>
						<Text style={styles.empty}>Aucune partie ne correspond à ce filtre.</Text>
						{extensionFilter.length > 0 && (
							<Button
								label="Réinitialiser les filtres"
								variant="ghost"
								onPress={() => setExtensionFilter([])}
							/>
						)}
					</View>
				) : (
					<>
						<RecordsSection records={records} players={playersWithGames} />

						{leaderboard.length > 0 && (
							<>
								<SectionTitle>Taux de victoire</SectionTitle>
								<View style={styles.wonderList}>
									{leaderboard.map((entry, index) => {
										const player = playersWithGames.find((p) => p.id === entry.playerId);
										if (!player) return null;
										return (
											<PlayerWinRateRow
												key={entry.playerId}
												rank={index + 1}
												player={player}
												entry={entry}
											/>
										);
									})}
								</View>
							</>
						)}

						{viewMode === "table" ? (
							<>
								<SectionTitle>Moyenne de points par catégorie</SectionTitle>
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
					</>
				)}

				{bestWonders.length > 0 && (
					<>
						<SectionTitle>Top 5 des meilleures merveilles</SectionTitle>
						<View style={styles.wonderList}>
							{bestWonders.map((wonder, index) => (
								<WonderRankingRow
									key={`${wonder.name}-${wonder.side}`}
									rank={index + 1}
									wonder={wonder}
								/>
							))}
						</View>

						<SectionTitle>Top 5 des pires merveilles</SectionTitle>
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
				emptyFilterState: {
					gap: SPACING.sm,
					alignItems: "center",
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
