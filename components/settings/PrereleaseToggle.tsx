import { useMemo } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import type { ThemeColors } from "@/constants/theme";
import { cardSurface, RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { useIncludePrereleases, useUpdateStore } from "@/stores/updateStore";

const LABEL = "Recevoir les versions de test";

/**
 * Inscrit l'appareil aux alpha/bêta : vérification et bandeau les proposent comme une mise à jour.
 * Activé d'office sur une version de test tant que l'utilisateur n'a rien choisi.
 */
export function PrereleaseToggle() {
	const colors = useColors();
	const styles = useStyles(colors);
	const enabled = useIncludePrereleases();
	const setPrereleases = useUpdateStore((s) => s.setPrereleases);

	return (
		<View style={styles.container}>
			<View style={styles.row}>
				<Text style={styles.label}>{LABEL}</Text>
				<Switch
					value={enabled}
					onValueChange={setPrereleases}
					trackColor={{ true: colors.primary, false: colors.border }}
					accessibilityLabel={LABEL}
				/>
			</View>
			<Text style={styles.hint}>
				Alpha et bêta : les nouveautés en avant-première, moins éprouvées. Pense à faire une
				sauvegarde avant d'en installer une. Une fois désactivé, la prochaine mise à jour proposée
				sera la version stable suivante.
			</Text>
		</View>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				container: {
					...cardSurface(colors),
					borderRadius: RADIUS.md,
					padding: SPACING.md,
					gap: SPACING.sm,
				},
				row: {
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-between",
					gap: SPACING.md,
				},
				label: {
					color: colors.text,
					fontSize: 15,
					flexShrink: 1,
				},
				hint: {
					color: colors.textMuted,
					fontSize: 13,
					lineHeight: 18,
				},
			}),
		[colors],
	);
}
