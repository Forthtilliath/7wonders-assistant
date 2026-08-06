import { router } from "expo-router";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { RankedPlayerCard } from "@/components/game/RankedPlayerCard";
import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { COLORS, SPACING } from "@/constants/theme";
import { useGameStore } from "@/stores/gameStore";
import { usePlayersStore } from "@/stores/playersStore";

export default function ResultsScreen() {
	const extensions = useGameStore((s) => s.extensions);
	const playerIds = useGameStore((s) => s.playerIds);
	const finishGame = useGameStore((s) => s.finishGame);
	const resetGame = useGameStore((s) => s.resetGame);
	const allPlayers = usePlayersStore((s) => s.players);
	const ranking = useGameStore((s) => s.getRanking());

	if (playerIds.length === 0) return null;

	const confirmFinish = () => {
		finishGame();
		router.dismissAll();
	};

	const confirmCancel = () => {
		Alert.alert("Annuler la partie ?", "Les scores saisis seront perdus.", [
			{ text: "Continuer la partie", style: "cancel" },
			{
				text: "Annuler la partie",
				style: "destructive",
				onPress: () => {
					resetGame();
					router.dismissAll();
				},
			},
		]);
	};

	return (
		<ScreenContainer>
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
			</ScrollView>

			<Button label="Terminer et enregistrer la partie" onPress={confirmFinish} />
			<Button
				label="Annuler la partie"
				variant="ghost"
				onPress={confirmCancel}
				style={styles.cancelButton}
			/>
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	title: {
		color: COLORS.text,
		fontSize: 22,
		fontWeight: "800",
		marginBottom: SPACING.md,
	},
	list: {
		gap: SPACING.sm,
		paddingBottom: SPACING.md,
	},
	cancelButton: {
		marginTop: SPACING.sm,
	},
});
