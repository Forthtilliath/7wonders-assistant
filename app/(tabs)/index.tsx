import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { SelectablePlayerCard } from "@/components/players/SelectablePlayerCard";
import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { EXTENSION_LABELS, EXTENSION_ORDER } from "@/constants/categories";
import { MAX_PLAYERS, MIN_PLAYERS } from "@/constants/game";
import type { ThemeColors } from "@/constants/theme";
import { RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { selectFeedback } from "@/lib/haptics";
import { useGameStore } from "@/stores/gameStore";
import { selectSortedGroups, useGroupsStore } from "@/stores/groupsStore";
import { selectSortedPlayers, usePlayersStore } from "@/stores/playersStore";
import { usePreferencesStore } from "@/stores/preferencesStore";
import type { ExtensionId, PlayerGroup } from "@/types/game";

export default function NewGameTab() {
	const router = useRouter();
	const colors = useColors();
	const styles = useStyles(colors);
	const players = usePlayersStore((s) => s.players);
	const groups = useGroupsStore((s) => s.groups);
	const defaultExtensions = usePreferencesStore((s) => s.defaultExtensions);
	const startNewGame = useGameStore((s) => s.startNewGame);
	const resetGame = useGameStore((s) => s.resetGame);
	const hasOngoingGame = useGameStore((s) => s.hasOngoingGame());

	const activePlayers = selectSortedPlayers(players.filter((p) => !p.isArchived));
	const sortedGroups = selectSortedGroups(groups.filter((g) => !g.isArchived));

	const [selectedIds, setSelectedIds] = useState<string[]>(() =>
		activePlayers
			.filter((p) => p.isFavorite)
			.slice(0, MAX_PLAYERS)
			.map((p) => p.id),
	);
	// Pré-coché avec les extensions habituelles configurées dans Réglages, modifiable ensuite.
	const [extensions, setExtensions] = useState<ExtensionId[]>(() => defaultExtensions);

	const toggleSelected = (id: string) => {
		setSelectedIds((current) => {
			if (current.includes(id)) return current.filter((p) => p !== id);
			if (current.length >= MAX_PLAYERS) return current;
			return [...current, id];
		});
	};

	const toggleExtension = (ext: ExtensionId) => {
		selectFeedback();
		setExtensions((current) =>
			current.includes(ext) ? current.filter((e) => e !== ext) : [...current, ext],
		);
	};

	// Sélectionne d'un coup les membres (actifs) d'un groupe, à la place de la sélection courante.
	const isGroupActive = (group: PlayerGroup) =>
		group.playerIds.length === selectedIds.length &&
		group.playerIds.every((id) => selectedIds.includes(id));

	const applyGroup = (group: PlayerGroup) => {
		selectFeedback();
		const memberIds = group.playerIds
			.filter((id) => activePlayers.some((p) => p.id === id))
			.slice(0, MAX_PLAYERS);
		setSelectedIds(memberIds);
	};

	const canStart = selectedIds.length >= MIN_PLAYERS;

	const startGame = () => {
		startNewGame(selectedIds, extensions);
		router.push("/game/score/military");
	};

	// Une partie en cours serait silencieusement écrasée par startNewGame() : on prévient plutôt que
	// de perdre des scores déjà saisis sans le vouloir.
	const confirmStart = () => {
		if (!hasOngoingGame) {
			startGame();
			return;
		}
		Alert.alert(
			"Une partie est en cours",
			"La démarrer maintenant abandonnera la partie en cours : les scores déjà saisis seront perdus.",
			[
				{ text: "Annuler", style: "cancel" },
				{ text: "Démarrer quand même", style: "destructive", onPress: startGame },
			],
		);
	};

	const confirmAbandon = () => {
		Alert.alert("Abandonner la partie en cours ?", "Les scores déjà saisis seront perdus.", [
			{ text: "Annuler", style: "cancel" },
			{ text: "Abandonner", style: "destructive", onPress: resetGame },
		]);
	};

	// Swipe gauche -> lance la partie, seulement si les critères (2 joueurs minimum) sont réunis.
	// Seuils horizontaux + tolérance verticale pour ne pas voler le scroll de la liste de joueurs.
	const swipeGesture = Gesture.Pan()
		.activeOffsetX([-20, 20])
		.failOffsetY([-15, 15])
		.runOnJS(true)
		.onEnd((event) => {
			if (event.translationX < -60 && canStart) {
				confirmStart();
			}
		});

	if (players.length === 0) {
		return (
			<ScreenContainer style={styles.onboarding}>
				<MaterialCommunityIcons name="account-group" size={48} color={colors.primary} />
				<Text style={styles.onboardingTitle}>Bienvenue !</Text>
				<Text style={styles.onboardingText}>
					Pour commencer, crée les joueurs avec qui tu joues. Tu pourras ensuite lancer une partie
					et suivre les scores au fil des parties.
				</Text>
				<Button label="Créer mon premier joueur" onPress={() => router.push("/players/new")} />
			</ScreenContainer>
		);
	}

	return (
		<GestureDetector gesture={swipeGesture}>
			<ScreenContainer>
				{hasOngoingGame && (
					<View style={styles.ongoingSection}>
						<Button
							label="Reprendre la partie en cours"
							onPress={() => router.push("/game/score/military")}
						/>
						<Button
							label="Abandonner la partie en cours"
							variant="ghost"
							onPress={confirmAbandon}
						/>
					</View>
				)}

				<ScrollView contentContainerStyle={styles.content}>
					{sortedGroups.length > 0 && (
						<>
							<Text style={styles.sectionTitle}>Groupes</Text>
							<View style={styles.chipsRow}>
								{sortedGroups.map((group) => {
									const active = isGroupActive(group);
									return (
										<Pressable
											key={group.id}
											style={[styles.chip, active && styles.chipActive]}
											onPress={() => applyGroup(group)}
											accessibilityRole="button"
											accessibilityLabel={`Sélectionner le groupe ${group.name}`}
											accessibilityState={{ selected: active }}
										>
											<Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
												{group.name}
											</Text>
										</Pressable>
									);
								})}
							</View>
						</>
					)}

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
								isFavorite={player.isFavorite}
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
									accessibilityRole="checkbox"
									accessibilityState={{ checked: active }}
									accessibilityLabel={EXTENSION_LABELS[ext]}
								>
									<Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
										{EXTENSION_LABELS[ext]}
									</Text>
								</Pressable>
							);
						})}
					</View>
				</ScrollView>

				<Button label="Lancer la partie" disabled={!canStart} onPress={confirmStart} />
			</ScreenContainer>
		</GestureDetector>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				ongoingSection: {
					gap: SPACING.sm,
					marginBottom: SPACING.md,
				},
				content: {
					gap: SPACING.md,
					paddingBottom: SPACING.md,
				},
				sectionTitle: {
					color: colors.textMuted,
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
					color: colors.textMuted,
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
					borderColor: colors.border,
				},
				chipActive: {
					backgroundColor: colors.primary,
					borderColor: colors.primary,
				},
				chipLabel: {
					color: colors.textMuted,
				},
				chipLabelActive: {
					color: colors.primaryText,
					fontWeight: "600",
				},
				onboarding: {
					flex: 1,
					alignItems: "center",
					justifyContent: "center",
					gap: SPACING.sm,
					padding: SPACING.lg,
				},
				onboardingTitle: {
					color: colors.text,
					fontSize: 22,
					fontWeight: "800",
				},
				onboardingText: {
					color: colors.textMuted,
					textAlign: "center",
					marginBottom: SPACING.md,
				},
			}),
		[colors],
	);
}
