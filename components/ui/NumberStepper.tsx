import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { COLORS, RADIUS } from "@/constants/theme";

type Props = {
	value: number;
	onChange: (value: number) => void;
	min?: number;
	max?: number;
	step?: number;
	accentColor?: string;
};

export function NumberStepper({ value, onChange, min = 0, max, step = 1, accentColor }: Props) {
	const clamp = (n: number) => {
		let result = n;
		if (min !== undefined) result = Math.max(min, result);
		if (max !== undefined) result = Math.min(max, result);
		return result;
	};

	const color = accentColor ?? COLORS.primary;

	return (
		<View style={styles.row}>
			<Pressable
				style={[styles.button, { backgroundColor: color }]}
				onPress={() => onChange(clamp(value - step))}
			>
				<Text style={styles.buttonLabel}>–</Text>
			</Pressable>

			<TextInput
				style={styles.value}
				keyboardType="number-pad"
				value={String(value)}
				onChangeText={(text) => {
					const parsed = Number.parseInt(text, 10);
					onChange(clamp(Number.isNaN(parsed) ? 0 : parsed));
				}}
				selectTextOnFocus
			/>

			<Pressable
				style={[styles.button, { backgroundColor: color }]}
				onPress={() => onChange(clamp(value + step))}
			>
				<Text style={styles.buttonLabel}>+</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	button: {
		width: 40,
		height: 40,
		borderRadius: RADIUS.sm,
		alignItems: "center",
		justifyContent: "center",
	},
	buttonLabel: {
		color: COLORS.primaryText,
		fontSize: 20,
		fontWeight: "700",
	},
	value: {
		minWidth: 48,
		textAlign: "center",
		color: COLORS.text,
		fontSize: 18,
		fontWeight: "700",
	},
});
