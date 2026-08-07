import { Pressable, StyleSheet, Text, View } from "react-native";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { EXTENSION_LABELS } from "@/constants/categories";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { formatDate } from "@/lib/date";
import { getGameRanking } from "@/lib/scoring/game";
import type { Game, Player } from "@/types/game";

type Props = {
	game: Game;
	players: Player[];
	onPress: () => void;
};

export function GameSummaryCard({ game, players, onPress }: Props) {
	const ranking = getGameRanking(game);
	const winnerScore = ranking[0];
	const winner = players.find((p) => p.id === winnerScore?.playerId);

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

			{game.extensions.length > 0 && (
				<View style={styles.extensionsRow}>
					{game.extensions.map((ext) => (
						<View key={ext} style={styles.extensionChip}>
							<Text style={styles.extensionText}>{EXTENSION_LABELS[ext]}</Text>
						</View>
					))}
				</View>
			)}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: COLORS.surface,
		borderRadius: RADIUS.md,
		padding: SPACING.md,
		gap: SPACING.sm,
	},
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	date: {
		color: COLORS.textMuted,
		fontSize: 13,
		textTransform: "capitalize",
	},
	playerCount: {
		color: COLORS.textMuted,
		fontSize: 13,
	},
	winnerRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: SPACING.sm,
	},
	winnerName: {
		flex: 1,
		color: COLORS.text,
		fontSize: 16,
		fontWeight: "700",
	},
	winnerScore: {
		color: COLORS.gold,
		fontWeight: "700",
	},
	extensionsRow: {
		flexDirection: "row",
		gap: SPACING.xs,
	},
	extensionChip: {
		backgroundColor: COLORS.surfaceAlt,
		borderRadius: RADIUS.full,
		paddingHorizontal: SPACING.sm,
		paddingVertical: 2,
	},
	extensionText: {
		color: COLORS.textMuted,
		fontSize: 11,
	},
});
