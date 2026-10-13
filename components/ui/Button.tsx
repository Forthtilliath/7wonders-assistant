import { tapFeedback } from "@forthtilliath/react-native-kit/utils/helpers/haptics";
import { useMemo } from "react";
import { Pressable, type StyleProp, StyleSheet, Text, type ViewStyle } from "react-native";
import type { ThemeColors } from "@/constants/theme";
import { FONTS, RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

type Variant = "primary" | "secondary" | "danger" | "ghost";

type Props = {
	label: string;
	onPress?: () => void;
	variant?: Variant;
	disabled?: boolean;
	style?: StyleProp<ViewStyle>;
	/** Libellé lu par le lecteur d'écran, si différent du texte affiché. */
	accessibilityLabel?: string;
};

export function Button({
	label,
	onPress,
	variant = "primary",
	disabled,
	style,
	accessibilityLabel,
}: Props) {
	const colors = useColors();
	const styles = useStyles(colors);
	const labelVariant = LABEL_VARIANT[variant];

	return (
		<Pressable
			disabled={disabled}
			onPress={() => {
				tapFeedback();
				onPress?.();
			}}
			style={({ pressed }) => [
				styles.base,
				styles[variant],
				disabled && styles.disabled,
				pressed && !disabled && styles.pressed,
				style,
			]}
			accessibilityRole="button"
			accessibilityLabel={accessibilityLabel ?? label}
			accessibilityState={{ disabled: !!disabled }}
		>
			<Text style={[styles.label, labelVariant && styles[labelVariant]]}>{label}</Text>
		</Pressable>
	);
}

// Libellé sur `primaryText` par défaut (fonds bronze et rouge) ; les variantes sans fond plein
// reprennent une couleur lisible sur la surface.
const LABEL_VARIANT = {
	primary: null,
	danger: null,
	secondary: "secondaryLabel",
	ghost: "ghostLabel",
} as const;

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				base: {
					paddingVertical: SPACING.md,
					paddingHorizontal: SPACING.lg,
					borderRadius: RADIUS.md,
					borderWidth: 1,
					borderColor: "transparent",
					alignItems: "center",
					justifyContent: "center",
				},
				label: {
					color: colors.primaryText,
					fontFamily: FONTS.displayBold,
					fontSize: 16,
					letterSpacing: 0.6,
					textAlign: "center",
				},
				secondaryLabel: {
					color: colors.text,
				},
				ghostLabel: {
					color: colors.primary,
				},
				pressed: {
					opacity: 0.75,
				},
				disabled: {
					opacity: 0.4,
				},
				// Liseré doré : la plaque de bronze ressort même sur un fond proche.
				primary: { backgroundColor: colors.primary, borderColor: colors.gold },
				secondary: { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
				danger: { backgroundColor: colors.danger },
				ghost: { backgroundColor: "transparent", borderColor: colors.primary },
			}),
		[colors],
	);
}
