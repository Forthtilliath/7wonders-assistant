import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CategoryComparisonChart } from "@/components/game/CategoryComparisonChart";
import { CategoryPieChart } from "@/components/stats/CategoryPieChart";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { ThemeColors } from "@/constants/theme";
import { cardSurface, RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { getCategoryScore, type RankedPlayerScore } from "@/lib/scoring/total";
import type { CategoryId, Player } from "@/types/game";

type Props = {
	categories: CategoryId[];
	/** Joueurs de la partie, dans l'ordre de saisie (les joueurs supprimés depuis en sont exclus). */
	players: Player[];
	ranking: RankedPlayerScore[];
};

/**
 * Graphiques d'une partie : répartition des points de chaque joueur, puis comparaison des joueurs
 * catégorie par catégorie. Partagés entre l'écran de résultats et le détail d'une partie de
 * l'historique.
 */
export function GameCharts({ categories, players, ranking }: Props) {
	const colors = useColors();
	const styles = useStyles(colors);

	return (
		<>
			<SectionTitle style={styles.sectionTitle}>Répartition par joueur</SectionTitle>
			{players.map((player) => {
				const score = ranking.find((s) => s.playerId === player.id);
				if (!score) return null;
				const values: Partial<Record<CategoryId, number>> = {};
				for (const category of categories) {
					values[category] = getCategoryScore(score, category);
				}
				return (
					<View key={player.id} style={styles.chartCard}>
						<View style={styles.chartCardHeader}>
							<PlayerAvatar
								name={player.name}
								avatarUri={player.avatarUri}
								seed={player.id}
								size={32}
							/>
							<Text style={styles.chartCardName}>{player.name}</Text>
						</View>
						<CategoryPieChart categories={categories} values={values} />
					</View>
				);
			})}

			<SectionTitle style={styles.sectionTitle}>Comparaison par catégorie</SectionTitle>
			{categories.map((category) => (
				<View key={category} style={styles.chartCard}>
					<CategoryComparisonChart category={category} players={players} scores={ranking} />
				</View>
			))}
		</>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				sectionTitle: {
					marginTop: SPACING.sm,
				},
				chartCard: {
					...cardSurface(colors),
					borderRadius: RADIUS.md,
					padding: SPACING.md,
					gap: SPACING.sm,
				},
				chartCardHeader: {
					flexDirection: "row",
					alignItems: "center",
					gap: SPACING.sm,
				},
				chartCardName: {
					color: colors.text,
					fontSize: 15,
					fontWeight: "700",
				},
			}),
		[colors],
	);
}
