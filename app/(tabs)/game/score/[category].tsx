import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { CategoryEntryRow } from "@/components/game/CategoryEntryRow";
import { EditExtensionsSheet } from "@/components/game/EditExtensionsSheet";
import { TokenCounterSheet } from "@/components/game/TokenCounterSheet";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { CATEGORY_META } from "@/constants/categories";
import type { ThemeColors } from "@/constants/theme";
import { SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { getCategoryFlow } from "@/lib/categoryFlow";
import { MILITARY_TOKENS, NAVAL_TOKENS } from "@/lib/scoring/tokens";
import { useGameStore } from "@/stores/gameStore";
import { usePlayersStore } from "@/stores/playersStore";
import type { CategoryId } from "@/types/game";

// Rappel affiché une seule fois en haut de l'écran (pas par joueur) pour les catégories qui en
// ont besoin.
const CATEGORY_HINTS: Partial<Record<CategoryId, string>> = {
	military: "Additionne tes jetons militaires : Victoire (+1/+3/+5) et Défaite (-1).",
	treasury: "Compte tes pièces ÷ 3, moins tes éventuels jetons de dette (extension Cités).",
	naval: "Additionne tes jetons navals : Victoire (+1 à +7) et Défaite (-1/-2/-3).",
	babel: "Tuiles Babel posées : 1 tuile = 2 pts, 2 tuiles = 5 pts, 3 tuiles = 10 pts.",
};

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
	// Joueur pour lequel le compteur de jetons est ouvert (military/naval uniquement) ; se
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
		category === "military" ? MILITARY_TOKENS : category === "naval" ? NAVAL_TOKENS : null;

	const goNext = () => {
		if (isLast) {
			// replace plutôt que push : si on revient corriger une catégorie depuis Résultats puis
			// qu'on y retourne, ça remplace l'écran au lieu d'en empiler un nouveau à chaque aller-retour.
			router.replace("/game/results");
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
									<Ionicons
										name={isLast ? "trophy" : "arrow-forward"}
										size={24}
										color={colors.text}
									/>
								</Pressable>
							</View>
						),
					}}
				/>

				<EditExtensionsSheet
					visible={extensionsSheetVisible}
					onClose={() => setExtensionsSheetVisible(false)}
					currentExtensions={extensions}
					playerCount={playerIds.length}
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
						return (
							<CategoryEntryRow
								key={player.id}
								category={category}
								player={player}
								entry={entry}
								color={meta.color}
								onChange={(patch) => updateEntry(player.id, patch)}
								onCountTokens={tokens ? () => setTokenSheetPlayerId(player.id) : undefined}
							/>
						);
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
			}),
		[colors],
	);
}
