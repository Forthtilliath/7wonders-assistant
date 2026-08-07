import { useMemo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import type { ThemeColors } from "@/constants/theme";
import { RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

type Props = {
	name: string;
	memberCount: number;
	onPress: () => void;
};

export function GroupChip({ name, memberCount, onPress }: Props) {
	const colors = useColors();
	const styles = useStyles(colors);

	return (
		<Pressable style={styles.chip} onPress={onPress}>
			<Text style={styles.name} numberOfLines={1}>
				{name}
			</Text>
			<Text style={styles.count}>
				{memberCount} joueur{memberCount > 1 ? "s" : ""}
			</Text>
		</Pressable>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				chip: {
					backgroundColor: colors.surface,
					borderRadius: RADIUS.md,
					paddingVertical: SPACING.sm,
					paddingHorizontal: SPACING.md,
					minWidth: 120,
					gap: 2,
				},
				name: {
					color: colors.text,
					fontSize: 14,
					fontWeight: "700",
				},
				count: {
					color: colors.textMuted,
					fontSize: 12,
				},
			}),
		[colors],
	);
}
