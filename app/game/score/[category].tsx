import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { EditExtensionsSheet } from "@/components/game/EditExtensionsSheet";
import { ManualPointsFields } from "@/components/game/ManualPointsFields";
import { PlayerScoreRow } from "@/components/game/PlayerScoreRow";
import { ScienceFields } from "@/components/game/ScienceFields";
import { TokenCounterSheet } from "@/components/game/TokenCounterSheet";
import { WonderNameField } from "@/components/game/WonderNameField";
import { Button } from "@/components/ui/Button";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { CATEGORY_META } from "@/constants/categories";
import type { ThemeColors } from "@/constants/theme";
import { SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { getCategoryFlow } from "@/lib/categoryFlow";
import { computeScienceScore } from "@/lib/scoring/science";
import { ARMADA_TOKENS, MILITARY_TOKENS } from "@/lib/scoring/tokens";
import { useGameStore } from "@/stores/gameStore";
import { usePlayersStore } from "@/stores/playersStore";
import type { CategoryId } from "@/types/game";

// Catégories dont le score est un total de points saisi directement (jetons/cartes déjà comptés
// par le joueur), par opposition aux catégories calculées automatiquement (sciences).
const MANUAL_CATEGORIES = [
	"military",
	"treasury",
	"wonders",
	"civilians",
	"commercials",
	"guilds",
	"leaders",
	"cities",
	"armada",
	"islands",
] as const;

// Catégories dont le total peut légitimement être négatif (jetons de défaite, dettes...).
const NEGATIVE_ALLOWED: Partial<Record<(typeof MANUAL_CATEGORIES)[number], boolean>> = {
	military: true,
	treasury: true,
	wonders: true,
	cities: true,
	armada: true,
};

// Rappel affiché une seule fois en haut de l'écran (pas par joueur) pour les catégories qui en
// ont besoin.
const CATEGORY_HINTS: Partial<Record<CategoryId, string>> = {
	military: "Additionne tes jetons militaires : Victoire (+1/+3/+5) et Défaite (-1).",
	treasury: "Compte tes pièces ÷ 3, moins tes éventuels jetons de dette (extension Cités).",
	armada: "Additionne tes jetons navals : Victoire (+1 à +7) et Défaite (-1/-2/-3).",
};

type ManualCategoryId = (typeof MANUAL_CATEGORIES)[number];

function isManualCategory(category: CategoryId): category is ManualCategoryId {
	return (MANUAL_CATEGORIES as readonly CategoryId[]).includes(category);
}

export default function CategoryScoreScreen() {
	const router = useRouter();
	const colors = useColors();
	const styles = useStyles(colors);
	const { category } = useLocalSearchParams<{ category: CategoryId }>();
	const extensions = useGameStore((s) => s.extensions);
	const playerIds = useGameStore((s) => s.playerIds);
	const entries = useGameStore((s) => s.entries);
	const updateEntry = useGameStore((s) => s.updateEntry);
	const updateExtensions = useGameStore((s) => s.updateExtensions);
	const allPlayers = usePlayersStore((s) => s.players);
	// Joueur pour lequel le compteur de jetons est ouvert (military/armada uniquement) ; se
	// réinitialise à chaque changement de catégorie via la key posée sur le composant plus bas.
	const [tokenSheetPlayerId, setTokenSheetPlayerId] = useState<string | null>(null);
	const [extensionsSheetVisible, setExtensionsSheetVisible] = useState(false);

	const flow = useMemo(() => getCategoryFlow(extensions), [extensions]);

	useEffect(() => {
		if (playerIds.length === 0) router.replace("/");
	}, [playerIds, router]);

	// Une extension retirée en cours de partie peut faire disparaître l'étape affichée (ex. on est
	// sur "Leaders" au moment où l'extension Leaders est désactivée) : on retombe sur la première
	// étape du nouveau parcours plutôt que de rester bloqué sur une catégorie qui n'existe plus.
	useEffect(() => {
		if (playerIds.length > 0 && !flow.includes(category)) {
			router.replace(`/game/score/${flow[0]}`);
		}
	}, [flow, category, playerIds.length, router]);

	if (playerIds.length === 0 || !flow.includes(category)) return null;

	const stepIndex = flow.indexOf(category);
	const isLast = stepIndex === flow.length - 1;
	const meta = CATEGORY_META[category];
	const gamePlayers = playerIds
		.map((id) => allPlayers.find((p) => p.id === id))
		.filter((p): p is NonNullable<typeof p> => p != null);

	// Seules ces deux catégories se comptent avec des jetons physiques ; les autres (Trésor,
	// Merveille, Cités...) sont des totaux à lire directement sur le plateau/les cartes.
	const tokens =
		category === "military" ? MILITARY_TOKENS : category === "armada" ? ARMADA_TOKENS : null;

	const goNext = () => {
		if (isLast) {
			router.push("/game/results");
		} else {
			router.push(`/game/score/${flow[stepIndex + 1]}`);
		}
	};

	// Swipe gauche -> catégorie suivante (comme le bouton "Suivant"), swipe droite -> catégorie
	// précédente (ou retour au menu depuis la première). `router.back()` réutilise l'écran déjà
	// empilé par la navigation précédente, ce qui donne gratuitement l'animation de retour inverse.
	// Tolérance verticale pour ne pas voler le scroll de la liste de joueurs.
	const swipeGesture = Gesture.Pan()
		.activeOffsetX([-20, 20])
		.failOffsetY([-15, 15])
		.runOnJS(true)
		.onEnd((event) => {
			if (event.translationX < -60) {
				goNext();
			} else if (event.translationX > 60) {
				router.back();
			}
		});

	return (
		<GestureDetector gesture={swipeGesture}>
			<ScreenContainer padded={false}>
				<Stack.Screen
					options={{
						title: meta.label,
						headerRight: () => (
							<View style={styles.headerActions}>
								<Pressable
									onPress={() => setExtensionsSheetVisible(true)}
									hitSlop={12}
									accessibilityRole="button"
									accessibilityLabel="Modifier les extensions de la partie"
								>
									<Ionicons name="options-outline" size={24} color={colors.text} />
								</Pressable>
								<Pressable
									onPress={goNext}
									hitSlop={12}
									accessibilityRole="button"
									accessibilityLabel={isLast ? "Voir les résultats" : "Étape suivante"}
								>
									<Ionicons name="chevron-forward" size={26} color={colors.text} />
								</Pressable>
							</View>
						),
					}}
				/>

				<EditExtensionsSheet
					visible={extensionsSheetVisible}
					onClose={() => setExtensionsSheetVisible(false)}
					currentExtensions={extensions}
					onConfirm={updateExtensions}
				/>

				<View style={[styles.progressBar, { backgroundColor: meta.color }]} />
				<Text style={styles.progress}>
					Étape {stepIndex + 1} / {flow.length}
				</Text>
				{CATEGORY_HINTS[category] && <Text style={styles.hint}>{CATEGORY_HINTS[category]}</Text>}

				<ScrollView contentContainerStyle={styles.list}>
					{gamePlayers.map((player) => {
						const entry = entries[player.id];
						if (!entry) return null;

						if (category === "scientifics") {
							return (
								<PlayerScoreRow
									key={player.id}
									player={player}
									points={computeScienceScore(entry.scientifics).total}
								>
									<ScienceFields
										value={entry.scientifics}
										onChange={(scientifics) =>
											updateEntry(player.id, (e) => ({ ...e, scientifics }))
										}
									/>
								</PlayerScoreRow>
							);
						}

						if (category === "wonders") {
							return (
								<PlayerScoreRow key={player.id} player={player}>
									<WonderNameField
										value={entry.wonder.name}
										onChange={(name) =>
											updateEntry(player.id, (e) => ({ ...e, wonder: { ...e.wonder, name } }))
										}
									/>
									<RadioGroup
										options={[
											{ value: "A", label: "Face A" },
											{ value: "B", label: "Face B" },
										]}
										value={entry.wonder.side}
										onChange={(side) =>
											updateEntry(player.id, (e) => ({ ...e, wonder: { ...e.wonder, side } }))
										}
									/>
									<ManualPointsFields
										points={entry.wonders.points}
										color={meta.color}
										min={NEGATIVE_ALLOWED.wonders ? -30 : 0}
										onChange={(points) =>
											updateEntry(player.id, (e) => ({ ...e, wonders: { points } }))
										}
									/>
								</PlayerScoreRow>
							);
						}

						if (isManualCategory(category)) {
							const current = entry[category];
							return (
								<PlayerScoreRow key={player.id} player={player}>
									<ManualPointsFields
										points={current.points}
										color={meta.color}
										min={NEGATIVE_ALLOWED[category] ? -30 : 0}
										onChange={(points) =>
											updateEntry(player.id, (e) => ({
												...e,
												[category]: { points },
											}))
										}
									/>
									{tokens && (
										<Button
											label="Compter par jetons"
											variant="ghost"
											onPress={() => setTokenSheetPlayerId(player.id)}
											accessibilityLabel={`Compter les jetons de ${player.name} un par un`}
										/>
									)}
								</PlayerScoreRow>
							);
						}

						return null;
					})}
				</ScrollView>

				{tokens && (
					<TokenCounterSheet
						visible={tokenSheetPlayerId != null}
						onClose={() => setTokenSheetPlayerId(null)}
						title={category === "military" ? "Jetons militaires" : "Jetons maritimes"}
						tokens={tokens}
						accentColor={meta.color}
						onConfirm={(total) => {
							if (tokenSheetPlayerId) {
								updateEntry(tokenSheetPlayerId, (e) => ({ ...e, [category]: { points: total } }));
							}
						}}
					/>
				)}

				<View style={styles.footer}>
					<Button label={isLast ? "Voir les résultats" : "Suivant"} onPress={goNext} />
				</View>
			</ScreenContainer>
		</GestureDetector>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				headerActions: {
					flexDirection: "row",
					alignItems: "center",
					gap: SPACING.md,
				},
				progressBar: {
					height: 4,
				},
				progress: {
					color: colors.textMuted,
					fontSize: 12,
					textAlign: "center",
					paddingVertical: SPACING.xs,
				},
				hint: {
					color: colors.textMuted,
					fontSize: 13,
					textAlign: "center",
					paddingHorizontal: SPACING.md,
					paddingBottom: SPACING.sm,
				},
				list: {
					gap: SPACING.sm,
					padding: SPACING.md,
				},
				footer: {
					padding: SPACING.md,
					borderTopWidth: 1,
					borderTopColor: colors.border,
				},
			}),
		[colors],
	);
}
