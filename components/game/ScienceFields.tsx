import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { NumberStepper } from "@/components/ui/NumberStepper";
import { MAX_SCIENCE_SYMBOLS } from "@/constants/game";
import type { ThemeColors } from "@/constants/theme";
import { SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
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
	{ key: "maxSymbols", label: "Symboles max (copie ton type dominant)" },
];

export function ScienceFields({ value, onChange }: Props) {
	const colors = useColors();
	const styles = useStyles(colors);
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
						max={MAX_SCIENCE_SYMBOLS}
						accentColor={colors.success}
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

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
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
					color: colors.textMuted,
				},
				hint: {
					color: colors.textMuted,
					fontSize: 12,
					fontStyle: "italic",
				},
			}),
		[colors],
	);
}
