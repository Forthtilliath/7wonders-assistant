import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { GameCharts } from "@/components/game/GameCharts";
import { ShareableRanking } from "@/components/game/ShareableRanking";
import { ShareGameSheet } from "@/components/game/ShareGameSheet";
import { Button } from "@/components/ui/Button";
import { CaptureFrame } from "@/components/ui/CaptureFrame";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { getOrderedCategories } from "@/constants/categories";
import type { ThemeColors } from "@/constants/theme";
import { FONTS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { useGameCapture } from "@/hooks/useGameCapture";
import { getGameRanking } from "@/lib/scoring/game";
import { useGameStore } from "@/stores/gameStore";
import { usePlayersStore } from "@/stores/playersStore";

export default function ResultsScreen() {
	const colors = useColors();
	const styles = useStyles(colors);
	const extensions = useGameStore((s) => s.extensions);
	const playerIds = useGameStore((s) => s.playerIds);
	const entries = useGameStore((s) => s.entries);
	const startedAt = useGameStore((s) => s.startedAt);
	const finishGame = useGameStore((s) => s.finishGame);
	const allPlayers = usePlayersStore((s) => s.players);
	// getRanking() recalcule à chaque appel : le sélectionner directement casserait la stabilité
	// de référence attendue par le store et provoquerait une boucle de rendu infinie. On calcule
	// donc le classement ici, mémorisé tant que les données brutes ne changent pas.
	const game = useMemo(
		() => ({ id: "", createdAt: startedAt ?? Date.now(), extensions, playerIds, entries }),
		[startedAt, extensions, playerIds, entries],
	);
	const ranking = useMemo(() => getGameRanking(game), [game]);
	const { rankingRef, chartsRef, capturing, shareImage } = useGameCapture();
	const [shareVisible, setShareVisible] = useState(false);
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
						<View style={styles.headerActions}>
							<Pressable
								onPress={() => setShareVisible(true)}
								hitSlop={12}
								accessibilityRole="button"
								accessibilityLabel="Partager la partie"
							>
								<Ionicons name="share-social-outline" size={24} color={colors.text} />
							</Pressable>
							<Pressable
								onPress={correctGame}
								hitSlop={12}
								accessibilityRole="button"
								accessibilityLabel="Corriger la partie"
							>
								<Ionicons name="arrow-undo-outline" size={24} color={colors.text} />
							</Pressable>
						</View>
					),
				}}
			/>
			<Text style={styles.title}>Classement</Text>
			<ScrollView contentContainerStyle={styles.list}>
				<CaptureFrame ref={chartsRef} capturing={capturing === "charts"} style={styles.capture}>
					<ShareableRanking
						ref={rankingRef}
						capturing={capturing === "ranking"}
						game={game}
						ranking={ranking}
						players={allPlayers}
					/>
					<GameCharts categories={categories} players={gamePlayers} ranking={ranking} />
				</CaptureFrame>
			</ScrollView>

			<Button label="Terminer et enregistrer la partie" onPress={confirmFinish} />
			<ShareGameSheet
				visible={shareVisible}
				onClose={() => setShareVisible(false)}
				game={game}
				shareImage={shareImage}
			/>
		</ScreenContainer>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				headerActions: {
					flexDirection: "row",
					gap: SPACING.lg,
				},
				title: {
					color: colors.text,
					fontSize: 22,
					fontFamily: FONTS.displayBold,
					marginBottom: SPACING.md,
				},
				list: {
					paddingBottom: SPACING.md,
				},
				capture: {
					gap: SPACING.sm,
				},
			}),
		[colors],
	);
}
