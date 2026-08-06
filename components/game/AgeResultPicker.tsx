import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS } from "@/constants/theme";
import type { AgeResult } from "@/types/game";

const OPTIONS: { value: AgeResult; label: string; color: string }[] = [
	{ value: "loss", label: "Défaite", color: COLORS.danger },
	{ value: "tie", label: "Égalité", color: COLORS.surfaceAlt },
	{ value: "win", label: "Victoire", color: COLORS.success },
];

type Props = {
	value: AgeResult;
	onChange: (value: AgeResult) => void;
};

export function AgeResultPicker({ value, onChange }: Props) {
	return (
		<View style={styles.row}>
			{OPTIONS.map((option) => {
				const selected = option.value === value;
				return (
					<Pressable
						key={option.value}
						style={[
							styles.option,
							{ borderColor: option.color },
							selected && { backgroundColor: option.color },
						]}
						onPress={() => onChange(option.value)}
					>
						<Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
							{option.label}
						</Text>
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
		alignItems: "center",
	},
	optionLabel: {
		color: COLORS.text,
		fontSize: 13,
		fontWeight: "600",
	},
	optionLabelSelected: {
		color: COLORS.primaryText,
	},
});
