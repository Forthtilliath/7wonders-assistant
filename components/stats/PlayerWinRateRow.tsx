import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import type { ThemeColors } from "@/constants/theme";
import { cardSurface, FONTS, RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import type { PlayerLeaderboardEntry } from "@/lib/stats";
import type { Player } from "@/types/game";

type Props = {
	rank: number;
	player: Player;
	entry: PlayerLeaderboardEntry;
};

export function PlayerWinRateRow({ rank, player, entry }: Props) {
	const colors = useColors();
	const styles = useStyles(colors);

	return (
		<View style={styles.row}>
			<Text style={styles.rank}>{rank}</Text>
			<PlayerAvatar name={player.name} avatarUri={player.avatarUri} seed={player.id} size={32} />
			<View style={styles.info}>
				<Text style={styles.name} numberOfLines={1}>
					{player.name}
				</Text>
				<Text style={styles.meta}>
					{entry.wins} victoire(s) sur {entry.gamesPlayed} partie(s)
				</Text>
			</View>
			<Text style={styles.winRate}>{Math.round(entry.winRate * 100)}%</Text>
		</View>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				row: {
					flexDirection: "row",
					alignItems: "center",
					gap: SPACING.sm,
					...cardSurface(colors),
					borderRadius: RADIUS.md,
					padding: SPACING.sm,
				},
				rank: {
					width: 20,
					textAlign: "center",
					color: colors.textMuted,
					fontWeight: "700",
				},
				info: {
					flex: 1,
				},
				name: {
					color: colors.text,
					fontWeight: "600",
				},
				meta: {
					color: colors.textMuted,
					fontSize: 12,
				},
				winRate: {
					color: colors.gold,
					fontFamily: FONTS.displayBold,
					fontSize: 16,
				},
			}),
		[colors],
	);
}
