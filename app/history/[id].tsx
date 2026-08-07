import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { RankedPlayerCard } from "@/components/game/RankedPlayerCard";
import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import type { ThemeColors } from "@/constants/theme";
import { SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { formatDate } from "@/lib/date";
import { getGameRanking } from "@/lib/scoring/game";
import { useHistoryStore } from "@/stores/historyStore";
import { usePlayersStore } from "@/stores/playersStore";

export default function GameDetailScreen() {
	const router = useRouter();
	const colors = useColors();
	const styles = useStyles(colors);
	const { id } = useLocalSearchParams<{ id: string }>();
	const game = useHistoryStore((s) => s.games.find((g) => g.id === id));
	const removeGame = useHistoryStore((s) => s.removeGame);
	const players = usePlayersStore((s) => s.players);

	if (!game) {
		return (
			<ScreenContainer>
				<Text style={styles.empty}>Partie introuvable.</Text>
			</ScreenContainer>
		);
	}

	const ranking = getGameRanking(game);

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

	return (
		<ScreenContainer>
			<Text style={styles.date}>{formatDate(game.createdAt)}</Text>
			<ScrollView contentContainerStyle={styles.list}>
				{ranking.map((score) => {
					const player = players.find((p) => p.id === score.playerId);
					if (!player) return null;
					return (
						<RankedPlayerCard
							key={score.playerId}
							player={player}
							score={score}
							extensions={game.extensions}
						/>
					);
				})}
			</ScrollView>
			<Button label="Supprimer cette partie" variant="danger" onPress={confirmDelete} />
		</ScreenContainer>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				date: {
					color: colors.textMuted,
					fontSize: 14,
					textTransform: "capitalize",
					marginBottom: SPACING.md,
				},
				list: {
					gap: SPACING.sm,
					paddingBottom: SPACING.md,
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
