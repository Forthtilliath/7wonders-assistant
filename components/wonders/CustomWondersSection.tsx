import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { ThemeColors } from "@/constants/theme";
import { SPACING } from "@/constants/theme";
import { WONDER_SOURCE_LABELS } from "@/constants/wonders";
import { useColors } from "@/hooks/useColors";
import { CustomWonderListEditor } from "./CustomWonderListEditor";

/** Merveilles ajoutées par l'utilisateur hors de toute extension (officielle ou non). */
export function CustomWondersSection() {
	const colors = useColors();
	const styles = useStyles(colors);

	return (
		<View style={styles.section}>
			<SectionTitle>{WONDER_SOURCE_LABELS.custom}</SectionTitle>
			<Text style={styles.note}>
				Merveilles sans extension (promo isolée…), proposées dans toutes les parties.
			</Text>
			<CustomWonderListEditor />
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
			}),
		[colors],
	);
}
