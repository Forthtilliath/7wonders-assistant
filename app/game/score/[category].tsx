import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ManualPointsFields } from "@/components/game/ManualPointsFields";
import { MilitaryFields } from "@/components/game/MilitaryFields";
import { PlayerScoreRow } from "@/components/game/PlayerScoreRow";
import { ScienceFields } from "@/components/game/ScienceFields";
import { TreasuryFields } from "@/components/game/TreasuryFields";
import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { CATEGORY_META } from "@/constants/categories";
import { COLORS, SPACING } from "@/constants/theme";
import { getCategoryFlow } from "@/lib/categoryFlow";
import { computeMilitaryScore } from "@/lib/scoring/military";
import { computeScienceScore } from "@/lib/scoring/science";
import { computeTreasuryScore } from "@/lib/scoring/treasury";
import { useGameStore } from "@/stores/gameStore";
import { usePlayersStore } from "@/stores/playersStore";
import type { CategoryId } from "@/types/game";

const MANUAL_CATEGORIES = [
	"wonders",
	"civilians",
	"commercials",
	"guilds",
	"leaders",
	"cities",
	"armada",
] as const;

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

			<ScrollView contentContainerStyle={styles.list}>
				{gamePlayers.map((player) => {
					const entry = entries[player.id];
					if (!entry) return null;

					if (category === "military") {
						return (
							<PlayerScoreRow
								key={player.id}
								player={player}
								points={computeMilitaryScore(entry.military).total}
							>
								<MilitaryFields
									value={entry.military}
									onChange={(military) => updateEntry(player.id, (e) => ({ ...e, military }))}
								/>
							</PlayerScoreRow>
						);
					}

					if (category === "treasury") {
						return (
							<PlayerScoreRow
								key={player.id}
								player={player}
								points={computeTreasuryScore(entry.treasury.coins)}
							>
								<TreasuryFields
									coins={entry.treasury.coins}
									onChange={(coins) =>
										updateEntry(player.id, (e) => ({ ...e, treasury: { coins } }))
									}
								/>
							</PlayerScoreRow>
						);
					}

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
							<PlayerScoreRow key={player.id} player={player} points={current.points}>
								<ManualPointsFields
									points={current.points}
									color={meta.color}
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
