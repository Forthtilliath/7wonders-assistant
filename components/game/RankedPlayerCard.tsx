import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { BASE_CATEGORY_ORDER, CATEGORY_META, EXTENSION_ORDER } from "@/constants/categories";
import type { ThemeColors } from "@/constants/theme";
import { RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import type { PlayerScoreBreakdown, RankedPlayerScore } from "@/lib/scoring/total";
import type { ExtensionId, Player } from "@/types/game";

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

type Props = {
	player: Player;
	score: RankedPlayerScore;
	extensions: ExtensionId[];
};

export function RankedPlayerCard({ player, score, extensions }: Props) {
	const colors = useColors();
	const styles = useStyles(colors);

	const categories = [
		...BASE_CATEGORY_ORDER,
		...EXTENSION_ORDER.filter((e) => extensions.includes(e)),
	];

	return (
		<View style={[styles.card, score.rank === 1 && styles.cardWinner]}>
			<View style={styles.header}>
				<Text style={styles.rank}>{MEDALS[score.rank] ?? `#${score.rank}`}</Text>
				<PlayerAvatar name={player.name} avatarUri={player.avatarUri} seed={player.id} size={44} />
				<Text style={styles.name} numberOfLines={1}>
					{player.name}
				</Text>
				<Text style={styles.total}>{score.total}</Text>
			</View>

			<View style={styles.breakdown}>
				{categories.map((category) => {
					const value = score[category as keyof PlayerScoreBreakdown] as number;
					if (!value) return null;
					return (
						<View key={category} style={styles.chip}>
							<MaterialCommunityIcons
								name={CATEGORY_META[category].icon}
								size={12}
								color={CATEGORY_META[category].color}
							/>
							<Text style={styles.chipText}>
								{CATEGORY_META[category].shortLabel} {value}
							</Text>
						</View>
					);
				})}
			</View>
		</View>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				card: {
					backgroundColor: colors.surface,
					borderRadius: RADIUS.md,
					padding: SPACING.md,
					gap: SPACING.sm,
				},
				cardWinner: {
					borderWidth: 1.5,
					borderColor: colors.gold,
				},
				header: {
					flexDirection: "row",
					alignItems: "center",
					gap: SPACING.sm,
				},
				rank: {
					fontSize: 20,
					width: 32,
					textAlign: "center",
				},
				name: {
					flex: 1,
					color: colors.text,
					fontSize: 17,
					fontWeight: "700",
				},
				total: {
					color: colors.gold,
					fontSize: 22,
					fontWeight: "800",
				},
				breakdown: {
					flexDirection: "row",
					flexWrap: "wrap",
					gap: SPACING.xs,
				},
				chip: {
					flexDirection: "row",
					alignItems: "center",
					gap: 4,
					backgroundColor: colors.surfaceAlt,
					borderRadius: RADIUS.full,
					paddingHorizontal: SPACING.sm,
					paddingVertical: 2,
				},
				chipText: {
					color: colors.textMuted,
					fontSize: 11,
				},
			}),
		[colors],
	);
}
