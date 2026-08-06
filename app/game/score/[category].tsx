import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ManualPointsFields } from "@/components/game/ManualPointsFields";
import { PlayerScoreRow } from "@/components/game/PlayerScoreRow";
import { ScienceFields } from "@/components/game/ScienceFields";
import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { CATEGORY_META } from "@/constants/categories";
import { COLORS, SPACING } from "@/constants/theme";
import { getCategoryFlow } from "@/lib/categoryFlow";
import { computeScienceScore } from "@/lib/scoring/science";
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
] as const;

// Catégories dont le total peut légitimement être négatif (jetons de défaite, dettes...).
const NEGATIVE_ALLOWED: Partial<Record<(typeof MANUAL_CATEGORIES)[number], boolean>> = {
	military: true,
	treasury: true,
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
	const { category } = useLocalSearchParams<{ category: CategoryId }>();
	const extensions = useGameStore((s) => s.extensions);
	const playerIds = useGameStore((s) => s.playerIds);
	const entries = useGameStore((s) => s.entries);
	const updateEntry = useGameStore((s) => s.updateEntry);
	const allPlayers = usePlayersStore((s) => s.players);

	useEffect(() => {
		if (playerIds.length === 0) router.replace("/game/new");
	}, [playerIds, router]);

	if (playerIds.length === 0) return null;

	const flow = getCategoryFlow(extensions);
	const stepIndex = flow.indexOf(category);
	const isLast = stepIndex === flow.length - 1;
	const meta = CATEGORY_META[category];
	const gamePlayers = playerIds
		.map((id) => allPlayers.find((p) => p.id === id))
		.filter((p): p is NonNullable<typeof p> => p != null);

	const goNext = () => {
		if (isLast) {
			router.push("/game/results");
		} else {
			router.push(`/game/score/${flow[stepIndex + 1]}`);
		}
	};

	return (
		<ScreenContainer padded={false}>
			<Stack.Screen options={{ title: meta.label }} />

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
									onChange={(scientifics) => updateEntry(player.id, (e) => ({ ...e, scientifics }))}
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
							</PlayerScoreRow>
						);
					}

					return null;
				})}
			</ScrollView>

			<View style={styles.footer}>
				<Button label={isLast ? "Voir les résultats" : "Suivant"} onPress={goNext} />
			</View>
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	progressBar: {
		height: 4,
	},
	progress: {
		color: COLORS.textMuted,
		fontSize: 12,
		textAlign: "center",
		paddingVertical: SPACING.xs,
	},
	hint: {
		color: COLORS.textMuted,
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
		borderTopColor: COLORS.border,
	},
});
