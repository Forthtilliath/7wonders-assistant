import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { SelectablePlayerCard } from "@/components/players/SelectablePlayerCard";
import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { EXTENSION_LABELS, EXTENSION_ORDER } from "@/constants/categories";
import { MAX_PLAYERS, MIN_PLAYERS } from "@/constants/game";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { useGameStore } from "@/stores/gameStore";
import { selectSortedPlayers, usePlayersStore } from "@/stores/playersStore";
import type { ExtensionId } from "@/types/game";

export default function NewGameTab() {
	const router = useRouter();
	const players = usePlayersStore((s) => s.players);
	const startNewGame = useGameStore((s) => s.startNewGame);
	const hasOngoingGame = useGameStore((s) => s.hasOngoingGame());

	const activePlayers = selectSortedPlayers(players.filter((p) => !p.isArchived));

	const [selectedIds, setSelectedIds] = useState<string[]>(() =>
		activePlayers
			.filter((p) => p.isFavorite)
			.slice(0, MAX_PLAYERS)
			.map((p) => p.id),
	);
	const [extensions, setExtensions] = useState<ExtensionId[]>([]);

	const toggleSelected = (id: string) => {
		setSelectedIds((current) => {
			if (current.includes(id)) return current.filter((p) => p !== id);
			if (current.length >= MAX_PLAYERS) return current;
			return [...current, id];
		});
	};

	const toggleExtension = (ext: ExtensionId) => {
		setExtensions((current) =>
			current.includes(ext) ? current.filter((e) => e !== ext) : [...current, ext],
		);
	};

	const canStart = selectedIds.length >= MIN_PLAYERS;

	const startGame = () => {
		startNewGame(selectedIds, extensions);
		router.push("/game/score/military");
	};

	// Swipe gauche -> lance la partie, seulement si les critères (2 joueurs minimum) sont réunis.
	// Seuils horizontaux + tolérance verticale pour ne pas voler le scroll de la liste de joueurs.
	const swipeGesture = Gesture.Pan()
		.activeOffsetX([-20, 20])
		.failOffsetY([-15, 15])
		.runOnJS(true)
		.onEnd((event) => {
			if (event.translationX < -60 && canStart) {
				startGame();
			}
		});

	return (
		<GestureDetector gesture={swipeGesture}>
			<ScreenContainer>
				{hasOngoingGame && (
					<Button
						label="Reprendre la partie en cours"
						onPress={() => router.push("/game/score/military")}
						style={styles.resumeButton}
					/>
				)}

				<ScrollView contentContainerStyle={styles.content}>
					<Text style={styles.sectionTitle}>
						Joueurs ({selectedIds.length}/{MAX_PLAYERS})
					</Text>
					<View style={styles.grid}>
						{activePlayers.map((player) => (
							<SelectablePlayerCard
								key={player.id}
								playerId={player.id}
								name={player.name}
								avatarUri={player.avatarUri}
								selected={selectedIds.includes(player.id)}
								onPress={() => toggleSelected(player.id)}
							/>
						))}
					</View>
					{activePlayers.length === 0 && (
						<Text style={styles.empty}>
							Aucun joueur disponible. Crée d'abord des joueurs dans l'onglet Joueurs.
						</Text>
					)}

					<Text style={styles.sectionTitle}>Extensions</Text>
					<View style={styles.chipsRow}>
						{EXTENSION_ORDER.map((ext) => {
							const active = extensions.includes(ext);
							return (
								<Pressable
									key={ext}
									style={[styles.chip, active && styles.chipActive]}
									onPress={() => toggleExtension(ext)}
								>
									<Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
										{EXTENSION_LABELS[ext]}
									</Text>
								</Pressable>
							);
						})}
					</View>
				</ScrollView>

				<Button label="Lancer la partie" disabled={!canStart} onPress={startGame} />
			</ScreenContainer>
		</GestureDetector>
	);
}

const styles = StyleSheet.create({
	resumeButton: {
		marginBottom: SPACING.md,
	},
	content: {
		gap: SPACING.md,
		paddingBottom: SPACING.md,
	},
	sectionTitle: {
		color: COLORS.textMuted,
		fontSize: 14,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginTop: SPACING.sm,
	},
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: SPACING.sm,
	},
	empty: {
		color: COLORS.textMuted,
	},
	chipsRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: SPACING.sm,
	},
	chip: {
		paddingVertical: SPACING.sm,
		paddingHorizontal: SPACING.md,
		borderRadius: RADIUS.full,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	chipActive: {
		backgroundColor: COLORS.primary,
		borderColor: COLORS.primary,
	},
	chipLabel: {
		color: COLORS.textMuted,
	},
	chipLabelActive: {
		color: COLORS.primaryText,
		fontWeight: "600",
	},
});
