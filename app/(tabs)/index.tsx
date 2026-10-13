import { MaterialCommunityIcons } from "@expo/vector-icons";
import { selectFeedback } from "@forthtilliath/react-native-kit/utils/helpers/haptics";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { BackupReminderBanner } from "@/components/backup/BackupReminderBanner";
import { GroupChips } from "@/components/game/GroupChips";
import { SelectablePlayerCard } from "@/components/players/SelectablePlayerCard";
import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { EXTENSION_LABELS, EXTENSION_ORDER } from "@/constants/categories";
import { getMaxPlayers, MIN_PLAYERS } from "@/constants/game";
import type { ThemeColors } from "@/constants/theme";
import { FONTS, RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { useGameStore } from "@/stores/gameStore";
import { selectSortedGroups, useGroupsStore } from "@/stores/groupsStore";
import { selectSortedPlayers, usePlayersStore } from "@/stores/playersStore";
import { usePreferencesStore } from "@/stores/preferencesStore";
import type { ExtensionId } from "@/types/game";

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
			.slice(0, getMaxPlayers(defaultExtensions))
			.map((p) => p.id),
	);
	// Pré-coché avec les extensions habituelles configurées dans Réglages, modifiable ensuite.
	const [extensions, setExtensions] = useState<ExtensionId[]>(() => defaultExtensions);
	const maxPlayers = getMaxPlayers(extensions);
	const tooManyPlayers = selectedIds.length > maxPlayers;

	const toggleSelected = (id: string) => {
		setSelectedIds((current) => {
			if (current.includes(id)) return current.filter((p) => p !== id);
			if (current.length >= maxPlayers) return current;
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
	const applyGroup = (memberIds: string[]) => {
		selectFeedback();
		setSelectedIds(memberIds);
	};

	// Décocher Cités avec 8 joueurs sélectionnés ne retire personne : on bloque le lancement.
	const canStart = selectedIds.length >= MIN_PLAYERS && !tooManyPlayers;

	const startGame = () => {
		startNewGame(selectedIds, extensions);
		router.push("/game/score/military");
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
				startGame();
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

	// Une seule partie à la fois : tant qu'une partie est en cours, on empêche d'en configurer une
	// nouvelle (qui l'écraserait silencieusement) plutôt que de proposer les deux options en même
	// temps. Il faut la reprendre ou l'abandonner explicitement pour débloquer l'écran.
	if (hasOngoingGame) {
		return (
			<ScreenContainer style={styles.onboarding}>
				<MaterialCommunityIcons name="progress-clock" size={48} color={colors.primary} />
				<Text style={styles.onboardingTitle}>Une partie est en cours</Text>
				<Text style={styles.onboardingText}>
					Termine ou abandonne la partie en cours avant d'en démarrer une nouvelle.
				</Text>
				<Button
					label="Reprendre la partie en cours"
					onPress={() => router.push("/game/score/military")}
				/>
				<Button label="Abandonner la partie en cours" variant="ghost" onPress={confirmAbandon} />
			</ScreenContainer>
		);
	}

	return (
		<GestureDetector gesture={swipeGesture}>
			<ScreenContainer>
				<ScrollView contentContainerStyle={styles.content}>
					<BackupReminderBanner />
					{sortedGroups.length > 0 && (
						<>
							<SectionTitle style={styles.sectionTitle}>Groupes</SectionTitle>
							<GroupChips
								groups={sortedGroups}
								activePlayerIds={activePlayers.map((p) => p.id)}
								selectedIds={selectedIds}
								maxPlayers={maxPlayers}
								onSelect={applyGroup}
							/>
						</>
					)}

					<SectionTitle style={styles.sectionTitle}>
						Joueurs ({selectedIds.length}/{maxPlayers})
					</SectionTitle>
					{tooManyPlayers && (
						<Text style={styles.warning}>
							Au-delà de {maxPlayers} joueurs, active l'extension {EXTENSION_LABELS.cities} ou
							retire un joueur.
						</Text>
					)}
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

					<SectionTitle style={styles.sectionTitle}>Extensions</SectionTitle>
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

				<Button label="Lancer la partie" disabled={!canStart} onPress={startGame} />
			</ScreenContainer>
		</GestureDetector>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				content: {
					gap: SPACING.md,
					paddingBottom: SPACING.md,
				},
				sectionTitle: {
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
				warning: {
					color: colors.danger,
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
					fontFamily: FONTS.displayBold,
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
