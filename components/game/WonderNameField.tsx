import { selectFeedback } from "@forthtilliath/react-native-kit/utils/helpers/haptics";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { TextField } from "@/components/ui/TextField";
import type { ThemeColors } from "@/constants/theme";
import { RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { getWonderNameSuggestions } from "@/lib/wonders";
import { useHistoryStore } from "@/stores/historyStore";

type Props = {
	value: string;
	onChange: (name: string) => void;
};

/** Champ de nom de merveille avec suggestions issues des noms déjà saisis dans l'historique, pour
 * réduire les doublons dus à des fautes de frappe dans les statistiques par merveille. */
export function WonderNameField({ value, onChange }: Props) {
	const colors = useColors();
	const styles = useStyles(colors);
	const games = useHistoryStore((s) => s.games);
	const suggestions = useMemo(() => getWonderNameSuggestions(games, value), [games, value]);

	return (
		<View style={styles.container}>
			<TextField placeholder="Nom de la merveille" value={value} onChangeText={onChange} />
			{suggestions.length > 0 && (
				<View style={styles.suggestions}>
					{suggestions.map((name) => (
						<Pressable
							key={name}
							style={styles.suggestion}
							onPress={() => {
								selectFeedback();
								onChange(name);
							}}
							accessibilityRole="button"
							accessibilityLabel={`Utiliser le nom ${name}`}
						>
							<Text style={styles.suggestionText}>{name}</Text>
						</Pressable>
					))}
				</View>
			)}
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
				suggestions: {
					flexDirection: "row",
					flexWrap: "wrap",
					gap: SPACING.xs,
				},
				suggestion: {
					paddingVertical: 4,
					paddingHorizontal: SPACING.sm,
					borderRadius: RADIUS.full,
					backgroundColor: colors.surfaceAlt,
				},
				suggestionText: {
					color: colors.textMuted,
					fontSize: 12,
				},
			}),
		[colors],
	);
}
