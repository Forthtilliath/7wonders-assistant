import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { EXTENSION_LABELS } from "@/constants/categories";
import type { ThemeColors } from "@/constants/theme";
import { cardSurface, RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { formatDate } from "@/lib/date";
import { getGameRanking } from "@/lib/scoring/game";
import { useWondersStore } from "@/stores/wondersStore";
import type { Game, Player } from "@/types/game";

type Props = {
	game: Game;
	players: Player[];
	onPress: () => void;
};

export function GameSummaryCard({ game, players, onPress }: Props) {
	const colors = useColors();
	const styles = useStyles(colors);
	const ranking = getGameRanking(game);
	const winnerScore = ranking[0];
	const winner = players.find((p) => p.id === winnerScore?.playerId);
	const packs = useWondersStore((s) => s.packs);
	// Une extension non officielle supprimée depuis n'est plus affichée.
	const packLabels = packs.filter((p) => game.wonderPacks?.includes(p.id)).map((p) => p.name);
	const labels = [...game.extensions.map((ext) => EXTENSION_LABELS[ext]), ...packLabels];

	return (
		<Pressable style={styles.card} onPress={onPress}>
			<View style={styles.row}>
				<Text style={styles.date}>{formatDate(game.createdAt)}</Text>
				<Text style={styles.playerCount}>{game.playerIds.length} joueurs</Text>
			</View>

			{winner && winnerScore && (
				<View style={styles.winnerRow}>
					<PlayerAvatar
						name={winner.name}
						avatarUri={winner.avatarUri}
						seed={winner.id}
						size={36}
					/>
					<Text style={styles.winnerName} numberOfLines={1}>
						🏆 {winner.name}
					</Text>
					<Text style={styles.winnerScore}>{winnerScore.total} pts</Text>
				</View>
			)}

			{labels.length > 0 && (
				<View style={styles.extensionsRow}>
					{labels.map((label) => (
						<View key={label} style={styles.extensionChip}>
							<Text style={styles.extensionText}>{label}</Text>
						</View>
					))}
				</View>
			)}
		</Pressable>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				card: {
					...cardSurface(colors),
					borderRadius: RADIUS.md,
					padding: SPACING.md,
					gap: SPACING.sm,
				},
				row: {
					flexDirection: "row",
					justifyContent: "space-between",
				},
				date: {
					color: colors.textMuted,
					fontSize: 13,
					textTransform: "capitalize",
				},
				playerCount: {
					color: colors.textMuted,
					fontSize: 13,
				},
				winnerRow: {
					flexDirection: "row",
					alignItems: "center",
					gap: SPACING.sm,
				},
				winnerName: {
					flex: 1,
					color: colors.text,
					fontSize: 16,
					fontWeight: "700",
				},
				winnerScore: {
					color: colors.gold,
					fontWeight: "700",
				},
				extensionsRow: {
					flexDirection: "row",
					gap: SPACING.xs,
				},
				extensionChip: {
					backgroundColor: colors.surfaceAlt,
					borderRadius: RADIUS.full,
					paddingHorizontal: SPACING.sm,
					paddingVertical: 2,
				},
				extensionText: {
					color: colors.textMuted,
					fontSize: 11,
				},
			}),
		[colors],
	);
}
