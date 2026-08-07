import { useMemo } from "react";
import { Pressable, type StyleProp, StyleSheet, Text, type ViewStyle } from "react-native";
import type { ThemeColors } from "@/constants/theme";
import { RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

type Variant = "primary" | "secondary" | "danger" | "ghost";

type Props = {
	label: string;
	onPress?: () => void;
	variant?: Variant;
	disabled?: boolean;
	style?: StyleProp<ViewStyle>;
};

export function Button({ label, onPress, variant = "primary", disabled, style }: Props) {
	const colors = useColors();
	const styles = useStyles(colors);

	return (
		<Pressable
			disabled={disabled}
			onPress={onPress}
			style={({ pressed }) => [
				styles.base,
				styles[variant],
				disabled && styles.disabled,
				pressed && !disabled && styles.pressed,
				style,
			]}
		>
			<Text style={[styles.label, variant === "ghost" && styles.ghostLabel]}>{label}</Text>
		</Pressable>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				base: {
					paddingVertical: SPACING.md,
					paddingHorizontal: SPACING.lg,
					borderRadius: RADIUS.md,
					alignItems: "center",
					justifyContent: "center",
				},
				label: {
					color: colors.primaryText,
					fontSize: 16,
					fontWeight: "600",
				},
				ghostLabel: {
					color: colors.text,
				},
				pressed: {
					opacity: 0.75,
				},
				disabled: {
					opacity: 0.4,
				},
				primary: { backgroundColor: colors.primary },
				secondary: { backgroundColor: colors.surfaceAlt },
				danger: { backgroundColor: colors.danger },
				ghost: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.border },
			}),
		[colors],
	);
}
