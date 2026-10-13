import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { EXTENSION_LABELS } from "@/constants/categories";
import { RANK_MEDALS } from "@/constants/game";
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

			<View style={styles.playersRow}>
				{ranking.map((score) => {
					// Un joueur supprimé depuis n'a plus ni nom ni avatar à afficher.
					const player = players.find((p) => p.id === score.playerId);
					if (!player) return null;
					return (
						<View key={player.id} style={styles.player}>
							<PlayerAvatar
								name={player.name}
								avatarUri={player.avatarUri}
								seed={player.id}
								size={36}
							/>
							<Text style={styles.playerName} numberOfLines={1}>
								{player.name}
							</Text>
							<Text style={[styles.playerScore, score.rank === 1 && styles.winnerScore]}>
								{RANK_MEDALS[score.rank] ?? `${score.rank}e`} {score.total}
							</Text>
						</View>
					);
				})}
			</View>

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
				// Largeur fixe : jusqu'à 7 joueurs tiennent sur une ligne, au-delà ils passent à la suivante.
				playersRow: {
					flexDirection: "row",
					flexWrap: "wrap",
					gap: SPACING.xs,
				},
				player: {
					width: 44,
					alignItems: "center",
					gap: 2,
				},
				playerName: {
					color: colors.text,
					fontSize: 11,
					fontWeight: "600",
				},
				playerScore: {
					color: colors.textMuted,
					fontSize: 11,
					fontVariant: ["tabular-nums"],
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
