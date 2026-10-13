import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { GameCharts } from "@/components/game/GameCharts";
import { ShareableRanking } from "@/components/game/ShareableRanking";
import { ShareGameSheet } from "@/components/game/ShareGameSheet";
import { Button } from "@/components/ui/Button";
import { CaptureFrame } from "@/components/ui/CaptureFrame";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { getOrderedCategories } from "@/constants/categories";
import { MIN_PLAYERS } from "@/constants/game";
import type { ThemeColors } from "@/constants/theme";
import { SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { useGameCapture } from "@/hooks/useGameCapture";
import { getGameRanking } from "@/lib/scoring/game";
import { useGameStore } from "@/stores/gameStore";
import { useHistoryStore } from "@/stores/historyStore";
import { usePlayersStore } from "@/stores/playersStore";
import { useWondersStore } from "@/stores/wondersStore";

export default function GameDetailScreen() {
	const router = useRouter();
	const colors = useColors();
	const styles = useStyles(colors);
	const { id } = useLocalSearchParams<{ id: string }>();
	const game = useHistoryStore((s) => s.games.find((g) => g.id === id));
	const removeGame = useHistoryStore((s) => s.removeGame);
	const players = usePlayersStore((s) => s.players);
	const startNewGame = useGameStore((s) => s.startNewGame);
	const { rankingRef, chartsRef, capturing, shareImage } = useGameCapture();
	const [shareVisible, setShareVisible] = useState(false);
	const [chartsVisible, setChartsVisible] = useState(false);

	if (!game) {
		return (
			<ScreenContainer edges={["bottom", "left", "right"]}>
				<Text style={styles.empty}>Partie introuvable.</Text>
			</ScreenContainer>
		);
	}

	const ranking = getGameRanking(game);
	const gamePlayers = game.playerIds
		.map((pid) => players.find((p) => p.id === pid))
		.filter((p): p is NonNullable<typeof p> => p != null);

	const confirmDelete = () => {
		Alert.alert("Supprimer cette partie ?", "Cette action est irréversible.", [
			{ text: "Annuler", style: "cancel" },
			{
				text: "Supprimer",
				style: "destructive",
				onPress: () => {
					removeGame(game.id);
					router.back();
				},
			},
		]);
	};

	const replay = (playerIds: string[]) => {
		// Les parties enregistrées avant le choix de l'édition retombent sur la 1re (défaut du store).
		// Sans les extensions non officielles supprimées depuis.
		const { packs } = useWondersStore.getState();
		const wonderPacks = (game.wonderPacks ?? []).filter((id) => packs.some((p) => p.id === id));
		startNewGame(playerIds, game.extensions, game.edition, wonderPacks);
		router.push("/game/score/military");
	};

	const confirmReplay = () => {
		const stillExisting = game.playerIds.filter((pid) => players.some((p) => p.id === pid));

		if (stillExisting.length < MIN_PLAYERS) {
			Alert.alert(
				"Impossible de rejouer",
				"Trop de joueurs de cette partie ont été supprimés depuis.",
			);
			return;
		}

		if (stillExisting.length < game.playerIds.length) {
			Alert.alert(
				"Certains joueurs ont été supprimés",
				"La partie démarrera uniquement avec les joueurs restants.",
				[
					{ text: "Annuler", style: "cancel" },
					{ text: "Continuer", onPress: () => replay(stillExisting) },
				],
			);
			return;
		}

		replay(stillExisting);
	};

	return (
		<ScreenContainer edges={["bottom", "left", "right"]}>
			<Stack.Screen
				options={{
					headerRight: () => (
						<Pressable
							onPress={() => setShareVisible(true)}
							hitSlop={12}
							accessibilityRole="button"
							accessibilityLabel="Partager la partie"
						>
							<Ionicons name="share-social-outline" size={24} color={colors.text} />
						</Pressable>
					),
				}}
			/>
			<ScrollView contentContainerStyle={styles.list}>
				<CaptureFrame ref={chartsRef} capturing={capturing === "charts"} style={styles.capture}>
					<ShareableRanking
						ref={rankingRef}
						capturing={capturing === "ranking"}
						game={game}
						ranking={ranking}
						players={players}
					/>
					{/* Pendant la capture avec graphiques : graphiques affichés même masqués, sans le bouton. */}
					{capturing !== "charts" && (
						<Button
							label={chartsVisible ? "Masquer les graphiques" : "Voir les graphiques"}
							variant="ghost"
							onPress={() => setChartsVisible((v) => !v)}
						/>
					)}
					{(chartsVisible || capturing === "charts") && (
						<GameCharts
							categories={getOrderedCategories(game.extensions)}
							players={gamePlayers}
							ranking={ranking}
						/>
					)}
				</CaptureFrame>
			</ScrollView>
			<Button
				label="Rejouer avec les mêmes joueurs"
				variant="secondary"
				onPress={confirmReplay}
				style={styles.replayButton}
			/>
			<Button label="Supprimer cette partie" variant="danger" onPress={confirmDelete} />
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
				list: {
					paddingTop: SPACING.sm,
					paddingBottom: SPACING.md,
				},
				capture: {
					gap: SPACING.sm,
				},
				replayButton: {
					marginBottom: SPACING.sm,
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
