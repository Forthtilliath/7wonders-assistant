import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { CATEGORY_META } from "@/constants/categories";
import type { ThemeColors } from "@/constants/theme";
import { cardSurface, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import type { PlayerStats } from "@/lib/stats";
import type { CategoryId, Player } from "@/types/game";

type Props = {
	players: Player[];
	categories: CategoryId[];
	statsByPlayerId: Record<string, PlayerStats>;
};

const LABEL_WIDTH = 100;
const PLAYER_WIDTH = 76;

/** Tableau croisé joueurs × catégories : moyenne de points par joueur pour chaque catégorie. */
export function ScoreTable({ players, categories, statsByPlayerId }: Props) {
	const colors = useColors();
	const styles = useStyles(colors);

	return (
		<ScrollView horizontal showsHorizontalScrollIndicator>
			<View>
				<View style={styles.row}>
					<View style={[styles.cell, styles.labelCell]} />
					{players.map((player) => (
						<View key={player.id} style={[styles.cell, styles.playerCell]}>
							<PlayerAvatar
								name={player.name}
								avatarUri={player.avatarUri}
								seed={player.id}
								size={28}
							/>
							<Text style={styles.playerName} numberOfLines={1}>
								{player.name}
							</Text>
						</View>
					))}
				</View>

				<View style={[styles.row, styles.totalRow]}>
					<View style={[styles.cell, styles.labelCell]}>
						<Text style={styles.labelTextBold}>Total</Text>
					</View>
					{players.map((player) => (
						<View key={player.id} style={[styles.cell, styles.playerCell]}>
							<Text style={styles.valueTextBold}>
								{Math.round(statsByPlayerId[player.id]?.averageTotal ?? 0)}
							</Text>
						</View>
					))}
				</View>

				{categories.map((category) => (
					<View key={category} style={styles.row}>
						<View style={[styles.cell, styles.labelCell]}>
							<MaterialCommunityIcons
								name={CATEGORY_META[category].icon}
								size={14}
								color={CATEGORY_META[category].color}
							/>
							<Text style={styles.labelText} numberOfLines={1}>
								{CATEGORY_META[category].shortLabel}
							</Text>
						</View>
						{players.map((player) => (
							<View key={player.id} style={[styles.cell, styles.playerCell]}>
								<Text style={styles.valueText}>
									{Math.round((statsByPlayerId[player.id]?.averageByCategory[category] ?? 0) * 10) /
										10}
								</Text>
							</View>
						))}
					</View>
				))}
			</View>
		</ScrollView>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				row: {
					flexDirection: "row",
					borderBottomWidth: 1,
					borderBottomColor: colors.border,
				},
				totalRow: {
					...cardSurface(colors),
				},
				cell: {
					alignItems: "center",
					justifyContent: "center",
					paddingVertical: SPACING.sm,
				},
				labelCell: {
					width: LABEL_WIDTH,
					flexDirection: "row",
					justifyContent: "flex-start",
					gap: 6,
					paddingLeft: SPACING.xs,
				},
				playerCell: {
					width: PLAYER_WIDTH,
					gap: 4,
				},
				playerName: {
					color: colors.text,
					fontSize: 11,
					maxWidth: PLAYER_WIDTH - 8,
				},
				labelText: {
					color: colors.textMuted,
					fontSize: 12,
					flexShrink: 1,
				},
				labelTextBold: {
					color: colors.text,
					fontSize: 12,
					fontWeight: "700",
				},
				valueText: {
					color: colors.text,
					fontSize: 13,
				},
				valueTextBold: {
					color: colors.gold,
					fontSize: 15,
					fontWeight: "700",
				},
			}),
		[colors],
	);
}
