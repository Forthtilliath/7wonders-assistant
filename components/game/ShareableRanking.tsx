import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { RankedPlayerCard } from "@/components/game/RankedPlayerCard";
import { EXTENSION_LABELS } from "@/constants/categories";
import type { ThemeColors } from "@/constants/theme";
import { SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { formatDate } from "@/lib/date";
import type { RankedPlayerScore } from "@/lib/scoring/total";
import type { Game, Player } from "@/types/game";

type Props = {
	game: Game;
	ranking: RankedPlayerScore[];
	players: Player[];
	/** Cartes de cette largeur, en grille sur plusieurs colonnes (image partagée). Sinon, en liste. */
	cardWidth?: number;
};

/** Classement d'une partie (date, extensions, cartes des joueurs), à l'écran et dans l'image partagée. */
export function ShareableRanking({ game, ranking, players, cardWidth }: Props) {
	const colors = useColors();
	const styles = useStyles(colors);
	const extensions = game.extensions.map((ext) => EXTENSION_LABELS[ext]).join(", ");

	return (
		<View style={styles.container}>
			<Text style={styles.caption}>
				{formatDate(game.createdAt)}
				{extensions ? ` · ${extensions}` : ""}
			</Text>
			<View style={[styles.container, cardWidth != null && styles.grid]}>
				{ranking.map((score) => {
					const player = players.find((p) => p.id === score.playerId);
					if (!player) return null;
					return (
						<View key={score.playerId} style={cardWidth != null && { width: cardWidth }}>
							<RankedPlayerCard player={player} score={score} extensions={game.extensions} />
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
				container: {
					gap: SPACING.sm,
				},
				grid: {
					flexDirection: "row",
					flexWrap: "wrap",
					alignItems: "flex-start",
				},
				caption: {
					color: colors.textMuted,
					fontSize: 14,
				},
			}),
		[colors],
	);
}
