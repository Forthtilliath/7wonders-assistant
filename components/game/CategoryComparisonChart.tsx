import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { getInitials } from "@/components/ui/PlayerAvatar";
import { CATEGORY_META } from "@/constants/categories";
import type { ThemeColors } from "@/constants/theme";
import { SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { getAvatarColor } from "@/lib/avatarColor";
import { getCategoryScore, type RankedPlayerScore } from "@/lib/scoring/total";
import type { CategoryId, Player } from "@/types/game";

type Props = {
	category: CategoryId;
	players: Player[];
	scores: RankedPlayerScore[];
};

/**
 * Barres horizontales comparant les joueurs entre eux sur une seule catégorie (score de fin de
 * partie), une couleur par barre dérivée de l'id du joueur (même couleur que son avatar ailleurs
 * dans l'app). Les valeurs négatives partent à gauche de l'axe zéro.
 *
 * Dessiné avec de simples `View` plutôt qu'avec `react-native-gifted-charts` : en mode
 * `horizontal`, la librairie fait pivoter tout le graphique et rend les libellés des barres
 * négatives à l'envers et les graduations de travers.
 */
export function CategoryComparisonChart({ category, players, scores }: Props) {
	const colors = useColors();
	const styles = useStyles(colors);
	const meta = CATEGORY_META[category];

	const rows = players.map((player) => {
		const score = scores.find((s) => s.playerId === player.id);
		return {
			id: player.id,
			value: score ? getCategoryScore(score, category) : 0,
			label: getInitials(player.name),
			color: getAvatarColor(player.id),
		};
	});
	const maxPositive = Math.max(0, ...rows.map((r) => r.value));
	const maxNegative = Math.max(0, ...rows.map((r) => -r.value));
	// Une seule échelle pour les deux côtés : chaque côté occupe une part de la piste
	// proportionnelle à son maximum, pour que les longueurs restent comparables.
	const range = maxPositive + maxNegative || 1;

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<MaterialCommunityIcons name={meta.icon} size={16} color={meta.color} />
				<Text style={styles.title}>{meta.label}</Text>
			</View>
			{rows.map((row) => (
				<View key={row.id} style={styles.row}>
					<Text style={styles.label} numberOfLines={1}>
						{row.label}
					</Text>
					<View style={styles.track}>
						{maxNegative > 0 && (
							<View style={[styles.side, styles.negativeSide, { flex: maxNegative / range }]}>
								{row.value < 0 && (
									<View
										style={[
											styles.bar,
											styles.negativeBar,
											{ width: `${(-row.value / maxNegative) * 100}%`, backgroundColor: row.color },
										]}
									/>
								)}
							</View>
						)}
						<View style={styles.zeroLine} />
						<View style={[styles.side, { flex: maxPositive > 0 ? maxPositive / range : 0 }]}>
							{row.value > 0 && (
								<View
									style={[
										styles.bar,
										styles.positiveBar,
										{ width: `${(row.value / maxPositive) * 100}%`, backgroundColor: row.color },
									]}
								/>
							)}
						</View>
					</View>
					<Text style={styles.value}>{row.value}</Text>
				</View>
			))}
		</View>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				container: {
					gap: SPACING.xs,
				},
				header: {
					flexDirection: "row",
					alignItems: "center",
					gap: 6,
					marginBottom: SPACING.xs,
				},
				title: {
					color: colors.text,
					fontSize: 14,
					fontWeight: "700",
				},
				row: {
					flexDirection: "row",
					alignItems: "center",
					gap: SPACING.sm,
				},
				label: {
					width: 28,
					color: colors.textMuted,
					fontSize: 12,
					fontWeight: "600",
				},
				track: {
					flex: 1,
					flexDirection: "row",
					height: 24,
				},
				side: {
					justifyContent: "center",
				},
				negativeSide: {
					alignItems: "flex-end",
				},
				zeroLine: {
					width: 1,
					backgroundColor: colors.border,
				},
				bar: {
					height: 18,
				},
				negativeBar: {
					borderTopLeftRadius: 9,
					borderBottomLeftRadius: 9,
				},
				positiveBar: {
					borderTopRightRadius: 9,
					borderBottomRightRadius: 9,
				},
				value: {
					width: 32,
					textAlign: "right",
					color: colors.text,
					fontSize: 13,
					fontWeight: "600",
					fontVariant: ["tabular-nums"],
				},
			}),
		[colors],
	);
}
