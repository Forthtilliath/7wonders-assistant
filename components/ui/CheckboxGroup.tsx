import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS } from "@/constants/theme";

type Option<T extends string> = {
	value: T;
	label: string;
};

type Props<T extends string> = {
	options: Option<T>[];
	values: T[];
	onChange: (values: T[]) => void;
};

/** Groupe de boutons à sélection multiple (chaque option se coche/décoche indépendamment). */
export function CheckboxGroup<T extends string>({ options, values, onChange }: Props<T>) {
	const toggle = (value: T) => {
		onChange(values.includes(value) ? values.filter((v) => v !== value) : [...values, value]);
	};

	return (
		<View style={styles.row}>
			{options.map((option) => {
				const checked = values.includes(option.value);
				return (
					<Pressable
						key={option.value}
						style={[styles.option, checked && styles.optionChecked]}
						onPress={() => toggle(option.value)}
					>
						<Text style={[styles.label, checked && styles.labelChecked]}>{option.label}</Text>
					</Pressable>
				);
			})}
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
	},
	option: {
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: RADIUS.full,
		borderWidth: 1.5,
		borderColor: COLORS.border,
	},
	optionChecked: {
		backgroundColor: COLORS.primary,
		borderColor: COLORS.primary,
	},
	label: {
		color: COLORS.textMuted,
		fontSize: 13,
		fontWeight: "600",
	},
	labelChecked: {
		color: COLORS.primaryText,
	},
});
