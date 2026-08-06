import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS } from "@/constants/theme";

type Option<T extends string> = {
	value: T;
	label: string;
};

type Props<T extends string> = {
	options: Option<T>[];
	value: T | null;
	onChange: (value: T) => void;
};

export function RadioGroup<T extends string>({ options, value, onChange }: Props<T>) {
	return (
		<View style={styles.row}>
			{options.map((option) => {
				const selected = value === option.value;
				return (
					<Pressable
						key={option.value}
						style={[styles.option, selected && styles.optionSelected]}
						onPress={() => onChange(option.value)}
					>
						<Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
					</Pressable>
				);
			})}
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		gap: 8,
	},
	option: {
		flex: 1,
		paddingVertical: 8,
		borderRadius: RADIUS.sm,
		borderWidth: 1.5,
		borderColor: COLORS.border,
		alignItems: "center",
	},
	optionSelected: {
		backgroundColor: COLORS.primary,
		borderColor: COLORS.primary,
	},
	label: {
		color: COLORS.textMuted,
		fontSize: 13,
		fontWeight: "600",
	},
	labelSelected: {
		color: COLORS.primaryText,
	},
});
