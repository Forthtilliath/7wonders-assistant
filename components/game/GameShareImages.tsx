import { type RefObject, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { GameCharts } from "@/components/game/GameCharts";
import { ShareableRanking } from "@/components/game/ShareableRanking";
import { getOrderedCategories } from "@/constants/categories";
import type { ThemeColors } from "@/constants/theme";
import { SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import type { RankedPlayerScore } from "@/lib/scoring/total";
import { getShareColumns, getShareWidth, SHARE_COLUMN_WIDTH } from "@/lib/shareLayout";
import type { Game, Player } from "@/types/game";

type Props = {
	game: Game;
	ranking: RankedPlayerScore[];
	/** Tous les joueurs (ceux supprimés depuis la partie en sont absents). */
	players: Player[];
	rankingRef: RefObject<View | null>;
	chartsRef: RefObject<View | null>;
};

/**
 * Les deux images partageables d'une partie (classement seul, classement et graphiques), rendues
 * hors de l'écran pour être capturées. Elles ont leur propre mise en page, en grille de cartes au
 * format proche du portrait 4:5 plutôt qu'en longue colonne : les messageries réduisent les
 * images à ~1600 px de haut, ce qui rendait l'ancienne capture de l'écran illisible.
 */
export function GameShareImages({ game, ranking, players, rankingRef, chartsRef }: Props) {
	const colors = useColors();
	const styles = useStyles(colors);
	const categories = getOrderedCategories(game.extensions);
	const gamePlayers = game.playerIds
		.map((id) => players.find((p) => p.id === id))
		.filter((p): p is NonNullable<typeof p> => p != null);
	const content = { playerCount: gamePlayers.length, categoryCount: categories.length };
	const rankingWidth = getShareWidth(getShareColumns({ ...content, withCharts: false }));
	const chartsWidth = getShareWidth(getShareColumns({ ...content, withCharts: true }));

	return (
		<View
			style={styles.offscreen}
			pointerEvents="none"
			accessibilityElementsHidden
			importantForAccessibility="no-hide-descendants"
		>
			<View ref={rankingRef} collapsable={false} style={styles.frame}>
				<View style={{ width: rankingWidth }}>
					<ShareableRanking
						game={game}
						ranking={ranking}
						players={players}
						cardWidth={SHARE_COLUMN_WIDTH}
					/>
				</View>
			</View>
			<View ref={chartsRef} collapsable={false} style={styles.frame}>
				<View style={[styles.content, { width: chartsWidth }]}>
					<ShareableRanking
						game={game}
						ranking={ranking}
						players={players}
						cardWidth={SHARE_COLUMN_WIDTH}
					/>
					<GameCharts
						categories={categories}
						players={gamePlayers}
						ranking={ranking}
						cardWidth={SHARE_COLUMN_WIDTH}
					/>
				</View>
			</View>
		</View>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				// Hors de l'écran mais bien rendue : la capture dessine la vue elle-même, où qu'elle soit.
				offscreen: {
					position: "absolute",
					top: 0,
					left: -10000,
					alignItems: "flex-start",
				},
				// Fond explicite : sans lui, l'image partagée serait un PNG transparent.
				frame: {
					backgroundColor: colors.background,
					padding: SPACING.md,
				},
				content: {
					gap: SPACING.sm,
				},
			}),
		[colors],
	);
}
