import { type Ref, useMemo } from "react";
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
	/** Vue capturée pour le partage en image : elle porte son propre fond (sinon PNG transparent). */
	ref?: Ref<View>;
};

/** Classement d'une partie (date, extensions, cartes des joueurs), tel qu'il est partagé en image. */
export function ShareableRanking({ game, ranking, players, ref }: Props) {
	const colors = useColors();
	const styles = useStyles(colors);
	const extensions = game.extensions.map((ext) => EXTENSION_LABELS[ext]).join(", ");

	return (
		<View ref={ref} collapsable={false} style={styles.container}>
			<Text style={styles.caption}>
				{formatDate(game.createdAt)}
				{extensions ? ` · ${extensions}` : ""}
			</Text>
			{ranking.map((score) => {
				const player = players.find((p) => p.id === score.playerId);
				if (!player) return null;
				return (
					<RankedPlayerCard
						key={score.playerId}
						player={player}
						score={score}
						extensions={game.extensions}
					/>
				);
			})}
		</View>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				// Marge négative compensée par le padding : la capture a un peu d'air autour des cartes
				// sans décaler leur alignement avec le reste de l'écran.
				container: {
					backgroundColor: colors.background,
					gap: SPACING.sm,
					padding: SPACING.sm,
					margin: -SPACING.sm,
				},
				caption: {
					color: colors.textMuted,
					fontSize: 14,
				},
			}),
		[colors],
	);
}
