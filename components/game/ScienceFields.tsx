import { StyleSheet, Text, View } from "react-native";
import { NumberStepper } from "@/components/ui/NumberStepper";
import { COLORS, SPACING } from "@/constants/theme";
import { computeScienceScore } from "@/lib/scoring/science";
import type { ScienceInput } from "@/types/game";

type Props = {
	value: ScienceInput;
	onChange: (value: ScienceInput) => void;
};

const SYMBOLS: { key: keyof ScienceInput; label: string }[] = [
	{ key: "gear", label: "Roues" },
	{ key: "compass", label: "Compas" },
	{ key: "tablet", label: "Tablettes" },
	{ key: "wildcards", label: "Symboles au choix" },
];

export function ScienceFields({ value, onChange }: Props) {
	const result = computeScienceScore(value);

	return (
		<View style={styles.container}>
			{SYMBOLS.map((symbol) => (
				<View key={symbol.key} style={styles.row}>
					<Text style={styles.label}>{symbol.label}</Text>
					<NumberStepper
						value={value[symbol.key]}
						onChange={(n) => onChange({ ...value, [symbol.key]: n })}
						min={0}
						accentColor={COLORS.success}
					/>
				</View>
			))}
			{value.wildcards > 0 && (
				<Text style={styles.hint}>
					Répartition optimale : {result.symbols.gear} roue(s), {result.symbols.compass} compas,{" "}
					{result.symbols.tablet} tablette(s)
				</Text>
			)}
			<Text style={styles.hint}>{result.setsCount} set(s) complet(s)</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		gap: SPACING.sm,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 12,
	},
	label: {
		flex: 1,
		flexShrink: 1,
		color: COLORS.textMuted,
	},
	hint: {
		color: COLORS.textMuted,
		fontSize: 12,
		fontStyle: "italic",
	},
});
