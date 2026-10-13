import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { ThemeColors } from "@/constants/theme";
import { RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

type Props = {
	title: string;
	/** Précision sous le titre (quand la merveille est proposée, édition…). */
	note?: string;
	names: string[];
};

/** Merveilles officielles d'une même origine (jeu de base ou extension), en puces. */
export function WonderSourceSection({ title, note, names }: Props) {
	const colors = useColors();
	const styles = useStyles(colors);

	return (
		<View style={styles.section}>
			<SectionTitle>{title}</SectionTitle>
			{note && <Text style={styles.note}>{note}</Text>}
			<View style={styles.chips}>
				{names.map((name) => (
					<View key={name} style={styles.chip}>
						<Text style={styles.chipText}>{name}</Text>
					</View>
				))}
			</View>
		</View>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				section: {
					gap: SPACING.sm,
				},
				note: {
					color: colors.textMuted,
					fontSize: 12,
				},
				chips: {
					flexDirection: "row",
					flexWrap: "wrap",
					gap: SPACING.xs,
				},
				chip: {
					paddingVertical: 4,
					paddingHorizontal: SPACING.sm,
					borderRadius: RADIUS.full,
					backgroundColor: colors.surfaceAlt,
				},
				chipText: {
					color: colors.text,
					fontSize: 13,
				},
			}),
		[colors],
	);
}
