import { StyleSheet, Text, View } from "react-native";
import { AgeResultPicker } from "@/components/game/AgeResultPicker";
import { COLORS, SPACING } from "@/constants/theme";
import type { MilitaryInput } from "@/types/game";

type Props = {
	value: MilitaryInput;
	onChange: (value: MilitaryInput) => void;
};

const AGES: { key: keyof MilitaryInput; label: string }[] = [
	{ key: "age1", label: "Âge I" },
	{ key: "age2", label: "Âge II" },
	{ key: "age3", label: "Âge III" },
];

export function MilitaryFields({ value, onChange }: Props) {
	return (
		<View style={styles.container}>
			{AGES.map((age) => (
				<View key={age.key} style={styles.ageRow}>
					<Text style={styles.ageLabel}>{age.label}</Text>
					<AgeResultPicker
						value={value[age.key]}
						onChange={(result) => onChange({ ...value, [age.key]: result })}
					/>
				</View>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		gap: SPACING.sm,
	},
	ageRow: {
		gap: 4,
	},
	ageLabel: {
		color: COLORS.textMuted,
		fontSize: 12,
	},
});
