import { StyleSheet, Text, TextInput, type TextInputProps, View } from "react-native";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";

type Props = TextInputProps & {
	label?: string;
};

export function TextField({ label, style, ...rest }: Props) {
	return (
		<View style={styles.wrapper}>
			{label ? <Text style={styles.label}>{label}</Text> : null}
			<TextInput placeholderTextColor={COLORS.textMuted} style={[styles.input, style]} {...rest} />
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		gap: SPACING.xs,
	},
	label: {
		color: COLORS.textMuted,
		fontSize: 14,
	},
	input: {
		backgroundColor: COLORS.surface,
		borderWidth: 1,
		borderColor: COLORS.border,
		borderRadius: RADIUS.md,
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.sm,
		color: COLORS.text,
		fontSize: 16,
	},
});
