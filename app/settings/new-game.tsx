import { useMemo } from "react";
import { StyleSheet, Text } from "react-native";
import { CheckboxGroup } from "@/components/ui/CheckboxGroup";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { EXTENSION_LABELS, EXTENSION_ORDER } from "@/constants/categories";
import type { ThemeColors } from "@/constants/theme";
import { SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { usePreferencesStore } from "@/stores/preferencesStore";
import type { ExtensionId } from "@/types/game";

const EXTENSION_OPTIONS = EXTENSION_ORDER.map((ext) => ({
	value: ext,
	label: EXTENSION_LABELS[ext],
}));

export default function NewGameSettingsScreen() {
	const colors = useColors();
	const styles = useStyles(colors);
	const defaultExtensions = usePreferencesStore((s) => s.defaultExtensions);
	const setDefaultExtensions = usePreferencesStore((s) => s.setDefaultExtensions);

	return (
		<ScreenContainer style={styles.container}>
			<Text style={styles.hint}>
				Ces extensions sont pré-cochées automatiquement à la création d'une nouvelle partie.
			</Text>
			<CheckboxGroup<ExtensionId>
				options={EXTENSION_OPTIONS}
				values={defaultExtensions}
				onChange={setDefaultExtensions}
			/>
		</ScreenContainer>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				container: {
					gap: SPACING.sm,
				},
				hint: {
					color: colors.textMuted,
					fontSize: 13,
				},
			}),
		[colors],
	);
}
