import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { ThemeColors } from "@/constants/theme";
import { RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { computeWonderStats, type WonderStats } from "@/lib/stats";
import {
	buildWonderGroupIndex,
	filterWonderStatsByGroup,
	getWonderStatGroups,
	WONDER_GROUP_ALL,
} from "@/lib/wonderPacks";
import { useWondersStore } from "@/stores/wondersStore";
import type { Game } from "@/types/game";
import { WonderRankingRow } from "./WonderRankingRow";

/** Au-delà, le classement se résume aux 5 meilleures et aux 5 pires merveilles. */
const FULL_RANKING_MAX = 10;
const TOP_COUNT = 5;

type Props = {
	games: Game[];
};

/**
 * Classement des merveilles par taux de victoire, filtrable par origine : officielles, chaque
 * extension non officielle, merveilles perso sans extension, autres noms saisis.
 */
export function WonderStatsSection({ games }: Props) {
	const colors = useColors();
	const styles = useStyles(colors);
	const customWonders = useWondersStore((s) => s.customWonders);
	const packs = useWondersStore((s) => s.packs);
	const [groupKey, setGroupKey] = useState(WONDER_GROUP_ALL);

	const stats = useMemo(() => computeWonderStats(games), [games]);
	const index = useMemo(() => buildWonderGroupIndex(customWonders, packs), [customWonders, packs]);
	const groups = useMemo(() => getWonderStatGroups(stats, index, packs), [stats, index, packs]);
	// Un groupe qui n'a plus de partie (filtre d'extensions changé, extension supprimée) retombe sur
	// « Toutes ».
	const activeKey = groups.some((g) => g.key === groupKey) ? groupKey : WONDER_GROUP_ALL;

	const sorted = useMemo(
		() =>
			filterWonderStatsByGroup(stats, index, activeKey).sort(
				(a, b) => b.winRate - a.winRate || b.timesPlayed - a.timesPlayed,
			),
		[stats, index, activeKey],
	);

	if (stats.length === 0) return null;

	return (
		<View style={styles.section}>
			<SectionTitle>Merveilles</SectionTitle>
			{groups.length > 2 && (
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.chips}
				>
					{groups.map((group) => {
						const selected = group.key === activeKey;
						return (
							<Pressable
								key={group.key}
								style={[styles.chip, selected && styles.chipSelected]}
								onPress={() => setGroupKey(group.key)}
								accessibilityRole="radio"
								accessibilityState={{ checked: selected }}
								accessibilityLabel={group.label}
							>
								<Text style={[styles.chipText, selected && styles.chipTextSelected]}>
									{group.label}
								</Text>
							</Pressable>
						);
					})}
				</ScrollView>
			)}

			{sorted.length <= FULL_RANKING_MAX ? (
				<RankingList title="Classement par taux de victoire" wonders={sorted} styles={styles} />
			) : (
				<>
					<RankingList
						title={`Top ${TOP_COUNT} des meilleures merveilles`}
						wonders={sorted.slice(0, TOP_COUNT)}
						styles={styles}
					/>
					<RankingList
						title={`Top ${TOP_COUNT} des pires merveilles`}
						wonders={sorted.slice(-TOP_COUNT).reverse()}
						styles={styles}
					/>
				</>
			)}
		</View>
	);
}

function RankingList({
	title,
	wonders,
	styles,
}: {
	title: string;
	wonders: WonderStats[];
	styles: ReturnType<typeof useStyles>;
}) {
	return (
		<View style={styles.list}>
			<Text style={styles.listTitle}>{title}</Text>
			{wonders.map((wonder, i) => (
				<WonderRankingRow key={`${wonder.name}-${wonder.side}`} rank={i + 1} wonder={wonder} />
			))}
		</View>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				section: {
					gap: SPACING.sm,
				},
				chips: {
					gap: SPACING.xs,
				},
				chip: {
					paddingVertical: 6,
					paddingHorizontal: SPACING.md,
					borderRadius: RADIUS.full,
					borderWidth: 1,
					borderColor: colors.border,
				},
				chipSelected: {
					backgroundColor: colors.primary,
					borderColor: colors.primary,
				},
				chipText: {
					color: colors.textMuted,
					fontSize: 13,
				},
				chipTextSelected: {
					color: colors.primaryText,
				},
				list: {
					gap: SPACING.xs,
				},
				listTitle: {
					color: colors.textMuted,
					fontSize: 13,
					fontWeight: "600",
				},
			}),
		[colors],
	);
}
