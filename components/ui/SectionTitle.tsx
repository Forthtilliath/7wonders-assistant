import type { ReactNode } from "react";
import { useMemo } from "react";
import { type StyleProp, StyleSheet, Text, View, type ViewStyle } from "react-native";
import type { ThemeColors } from "@/constants/theme";
import { FONTS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

type Props = {
	children: ReactNode;
	style?: StyleProp<ViewStyle>;
};

/** Titre de section façon inscription : losange doré, capitales Cinzel, puis filet jusqu'au bord. */
export function SectionTitle({ children, style }: Props) {
	const colors = useColors();
	const styles = useStyles(colors);

	return (
		<View style={[styles.row, style]} accessibilityRole="header">
			<View style={styles.diamond} />
			<Text style={styles.text}>{children}</Text>
			<View style={styles.rule} />
		</View>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				row: {
					flexDirection: "row",
					alignItems: "center",
					gap: SPACING.sm,
				},
				diamond: {
					width: 6,
					height: 6,
					backgroundColor: colors.gold,
					transform: [{ rotate: "45deg" }],
				},
				text: {
					color: colors.primary,
					fontFamily: FONTS.displayBold,
					fontSize: 13,
					letterSpacing: 1.2,
					textTransform: "uppercase",
				},
				rule: {
					flex: 1,
					height: 1,
					backgroundColor: colors.border,
				},
			}),
		[colors],
	);
}
