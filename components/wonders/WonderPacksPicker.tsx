import { useMemo } from "react";
import { type StyleProp, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { CheckboxGroup } from "@/components/ui/CheckboxGroup";
import type { ThemeColors } from "@/constants/theme";
import { SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { useWondersStore } from "@/stores/wondersStore";

type Props = {
	/** Ids des extensions non officielles cochées. */
	values: string[];
	onChange: (ids: string[]) => void;
	style?: StyleProp<ViewStyle>;
};

/**
 * Cases à cocher des extensions non officielles (par ordre alphabétique), sous un intitulé. Rien
 * n'est affiché tant que l'utilisateur n'en a créé aucune.
 */
export function WonderPacksPicker({ values, onChange, style }: Props) {
	const colors = useColors();
	const styles = useStyles(colors);
	const packs = useWondersStore((s) => s.packs);

	const options = useMemo(
		() =>
			[...packs]
				.sort((a, b) => a.name.localeCompare(b.name))
				.map((pack) => ({ value: pack.id, label: pack.name })),
		[packs],
	);

	if (options.length === 0) return null;

	return (
		<View style={[styles.container, style]}>
			<Text style={styles.label}>Extensions non officielles</Text>
			<CheckboxGroup options={options} values={values} onChange={onChange} />
		</View>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				container: {
					gap: SPACING.xs,
				},
				label: {
					color: colors.textMuted,
					fontSize: 13,
				},
			}),
		[colors],
	);
}
