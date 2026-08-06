import { Pressable, type StyleProp, StyleSheet, Text, type ViewStyle } from "react-native";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";

type Variant = "primary" | "secondary" | "danger" | "ghost";

type Props = {
	label: string;
	onPress?: () => void;
	variant?: Variant;
	disabled?: boolean;
	style?: StyleProp<ViewStyle>;
};

export function Button({ label, onPress, variant = "primary", disabled, style }: Props) {
	return (
		<Pressable
			disabled={disabled}
			onPress={onPress}
			style={({ pressed }) => [
				styles.base,
				variantStyles[variant],
				disabled && styles.disabled,
				pressed && !disabled && styles.pressed,
				style,
			]}
		>
			<Text style={[styles.label, variant === "ghost" && styles.ghostLabel]}>{label}</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	base: {
		paddingVertical: SPACING.md,
		paddingHorizontal: SPACING.lg,
		borderRadius: RADIUS.md,
		alignItems: "center",
		justifyContent: "center",
	},
	label: {
		color: COLORS.primaryText,
		fontSize: 16,
		fontWeight: "600",
	},
	ghostLabel: {
		color: COLORS.text,
	},
	pressed: {
		opacity: 0.75,
	},
	disabled: {
		opacity: 0.4,
	},
});

const variantStyles = StyleSheet.create({
	primary: { backgroundColor: COLORS.primary },
	secondary: { backgroundColor: COLORS.surfaceAlt },
	danger: { backgroundColor: COLORS.danger },
	ghost: { backgroundColor: "transparent", borderWidth: 1, borderColor: COLORS.border },
});
