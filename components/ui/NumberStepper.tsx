import { useEffect, useState } from "react";
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
	// "number-pad" a un clavier purement numérique, sans touche "-" sur Android. Dès qu'un
	// négatif est possible, on bascule sur "numeric" qui affiche le signe.
	const allowsNegative = min !== undefined && min < 0;

	// Texte affiché, distinct de `value` : le temps de taper "-13", l'état intermédiaire ("-",
	// "-1"...) n'est pas un nombre valide et ne doit pas être écrasé par la valeur committée.
	const [text, setText] = useState(String(value));

	useEffect(() => {
		setText(String(value));
	}, [value]);

	const commit = (raw: string) => {
		if (/^-?\d+$/.test(raw)) {
			onChange(clamp(Number.parseInt(raw, 10)));
		}
	};

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
				keyboardType={allowsNegative ? "numeric" : "number-pad"}
				value={text}
				onChangeText={(raw) => {
					const cleaned = allowsNegative ? raw.replace(/[^\d-]/g, "") : raw.replace(/\D/g, "");
					setText(cleaned);
					commit(cleaned);
				}}
				onBlur={() => setText(String(value))}
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
