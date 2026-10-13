import { type Ref, useMemo } from "react";
import { StyleSheet, Text, type View } from "react-native";
import { RankedPlayerCard } from "@/components/game/RankedPlayerCard";
import { CaptureFrame } from "@/components/ui/CaptureFrame";
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
	/** Vue capturée pour le partage en image du classement seul. */
	ref?: Ref<View>;
	/** Capture en cours : la vue porte alors son propre fond (voir `CaptureFrame`). */
	capturing?: boolean;
};

/** Classement d'une partie (date, extensions, cartes des joueurs), tel qu'il est partagé en image. */
export function ShareableRanking({ game, ranking, players, ref, capturing }: Props) {
	const colors = useColors();
	const styles = useStyles(colors);
	const extensions = game.extensions.map((ext) => EXTENSION_LABELS[ext]).join(", ");

	return (
		<CaptureFrame ref={ref} capturing={capturing} style={styles.container}>
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
		</CaptureFrame>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				container: {
					gap: SPACING.sm,
				},
				caption: {
					color: colors.textMuted,
					fontSize: 14,
				},
			}),
		[colors],
	);
}
