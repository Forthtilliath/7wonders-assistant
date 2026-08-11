import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { CategoryComparisonChart } from "@/components/game/CategoryComparisonChart";
import { RankedPlayerCard } from "@/components/game/RankedPlayerCard";
import { CategoryPieChart } from "@/components/stats/CategoryPieChart";
import { Button } from "@/components/ui/Button";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { getOrderedCategories } from "@/constants/categories";
import type { ThemeColors } from "@/constants/theme";
import { RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { getGameRanking } from "@/lib/scoring/game";
import { getCategoryScore } from "@/lib/scoring/total";
import { useGameStore } from "@/stores/gameStore";
import { usePlayersStore } from "@/stores/playersStore";
import type { CategoryId } from "@/types/game";

export default function ResultsScreen() {
	const colors = useColors();
	const styles = useStyles(colors);
	const extensions = useGameStore((s) => s.extensions);
	const playerIds = useGameStore((s) => s.playerIds);
	const entries = useGameStore((s) => s.entries);
	const finishGame = useGameStore((s) => s.finishGame);
	const allPlayers = usePlayersStore((s) => s.players);
	// getRanking() recalcule à chaque appel : le sélectionner directement casserait la stabilité
	// de référence attendue par le store et provoquerait une boucle de rendu infinie. On calcule
	// donc le classement ici, mémorisé tant que les données brutes ne changent pas.
	const ranking = useMemo(
		() => getGameRanking({ id: "", createdAt: 0, extensions, playerIds, entries }),
		[extensions, playerIds, entries],
	);
	const categories = useMemo(() => getOrderedCategories(extensions), [extensions]);
	const gamePlayers = playerIds
		.map((id) => allPlayers.find((p) => p.id === id))
		.filter((p): p is NonNullable<typeof p> => p != null);

	if (playerIds.length === 0) return null;

	const confirmFinish = () => {
		finishGame();
		router.dismissAll();
	};

	// Repart de la première catégorie pour reparcourir toute la saisie jusqu'aux résultats. Pas de
	// confirmation nécessaire : contrairement à l'ancien "Annuler la partie", rien n'est perdu, on
	// revient juste sur les écrans déjà remplis (dismissTo plutôt que push, pour ne pas en empiler
	// des doublons).
	const correctGame = () => {
		router.dismissTo(`/game/score/${categories[0]}`);
	};

	return (
		<ScreenContainer>
			<Stack.Screen
				options={{
					headerRight: () => (
						<Pressable
							onPress={correctGame}
							hitSlop={12}
							accessibilityRole="button"
							accessibilityLabel="Corriger la partie"
						>
							<Ionicons name="arrow-undo-outline" size={24} color={colors.text} />
						</Pressable>
					),
				}}
			/>
			<Text style={styles.title}>Classement</Text>
			<ScrollView contentContainerStyle={styles.list}>
				{ranking.map((score) => {
					const player = allPlayers.find((p) => p.id === score.playerId);
					if (!player) return null;
					return (
						<RankedPlayerCard
							key={score.playerId}
							player={player}
							score={score}
							extensions={extensions}
						/>
					);
				})}

				<Text style={styles.sectionTitle}>Répartition par joueur</Text>
				{gamePlayers.map((player) => {
					const score = ranking.find((s) => s.playerId === player.id);
					if (!score) return null;
					const values: Partial<Record<CategoryId, number>> = {};
					for (const category of categories) {
						values[category] = getCategoryScore(score, category);
					}
					return (
						<View key={player.id} style={styles.chartCard}>
							<View style={styles.chartCardHeader}>
								<PlayerAvatar
									name={player.name}
									avatarUri={player.avatarUri}
									seed={player.id}
									size={32}
								/>
								<Text style={styles.chartCardName}>{player.name}</Text>
							</View>
							<CategoryPieChart categories={categories} values={values} />
						</View>
					);
				})}

				<Text style={styles.sectionTitle}>Comparaison par catégorie</Text>
				{categories.map((category) => (
					<View key={category} style={styles.chartCard}>
						<CategoryComparisonChart category={category} players={gamePlayers} scores={ranking} />
					</View>
				))}
			</ScrollView>

			<Button label="Terminer et enregistrer la partie" onPress={confirmFinish} />
		</ScreenContainer>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				title: {
					color: colors.text,
					fontSize: 22,
					fontWeight: "800",
					marginBottom: SPACING.md,
				},
				list: {
					gap: SPACING.sm,
					paddingBottom: SPACING.md,
				},
				sectionTitle: {
					color: colors.textMuted,
					fontSize: 14,
					textTransform: "uppercase",
					letterSpacing: 0.5,
					marginTop: SPACING.sm,
				},
				chartCard: {
					backgroundColor: colors.surface,
					borderRadius: RADIUS.md,
					padding: SPACING.md,
					gap: SPACING.sm,
				},
				chartCardHeader: {
					flexDirection: "row",
					alignItems: "center",
					gap: SPACING.sm,
				},
				chartCardName: {
					color: colors.text,
					fontSize: 15,
					fontWeight: "700",
				},
			}),
		[colors],
	);
}
