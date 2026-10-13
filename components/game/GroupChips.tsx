import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { EXTENSION_LABELS } from "@/constants/categories";
import type { ThemeColors } from "@/constants/theme";
import { RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import type { PlayerGroup } from "@/types/game";

type Props = {
	groups: PlayerGroup[];
	/** Joueurs non archivés : seuls eux sont sélectionnés (et comptés) quand on applique un groupe. */
	activePlayerIds: string[];
	selectedIds: string[];
	maxPlayers: number;
	onSelect: (memberIds: string[]) => void;
};

/**
 * Raccourcis de sélection des groupes sur l'écran de nouvelle partie. Un groupe trop grand pour
 * les extensions cochées (8 joueurs sans Cités) reste visible mais désactivé.
 */
export function GroupChips({ groups, activePlayerIds, selectedIds, maxPlayers, onSelect }: Props) {
	const colors = useColors();
	const styles = useStyles(colors);

	return (
		<View style={styles.row}>
			{groups.map((group) => {
				const memberIds = group.playerIds.filter((id) => activePlayerIds.includes(id));
				const disabled = memberIds.length > maxPlayers;
				const active =
					memberIds.length === selectedIds.length &&
					memberIds.every((id) => selectedIds.includes(id));
				return (
					<Pressable
						key={group.id}
						style={[styles.chip, active && styles.chipActive, disabled && styles.chipDisabled]}
						onPress={() => onSelect(memberIds)}
						disabled={disabled}
						accessibilityRole="button"
						accessibilityLabel={`Sélectionner le groupe ${group.name}`}
						accessibilityHint={
							disabled
								? `${memberIds.length} joueurs : nécessite l'extension ${EXTENSION_LABELS.cities}`
								: undefined
						}
						accessibilityState={{ selected: active, disabled }}
					>
						<Text style={[styles.label, active && styles.labelActive]}>{group.name}</Text>
					</Pressable>
				);
			})}
		</View>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				row: {
					flexDirection: "row",
					flexWrap: "wrap",
					gap: SPACING.sm,
				},
				chip: {
					paddingVertical: SPACING.sm,
					paddingHorizontal: SPACING.md,
					borderRadius: RADIUS.full,
					borderWidth: 1,
					borderColor: colors.border,
				},
				chipActive: {
					backgroundColor: colors.primary,
					borderColor: colors.primary,
				},
				chipDisabled: {
					opacity: 0.4,
				},
				label: {
					color: colors.textMuted,
				},
				labelActive: {
					color: colors.primaryText,
					fontWeight: "600",
				},
			}),
		[colors],
	);
}
