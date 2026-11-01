import { useMemo } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { CheckboxGroup } from "@/components/ui/CheckboxGroup";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { WonderPacksPicker } from "@/components/wonders/WonderPacksPicker";
import { EXTENSION_LABELS } from "@/constants/categories";
import {
	EDITION_LABELS,
	GAME_EDITIONS,
	getAvailableExtensions,
	getExtensionsWarning,
} from "@/constants/editions";
import type { ThemeColors } from "@/constants/theme";
import { SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { useWondersStore } from "@/stores/wondersStore";
import type { ExtensionId } from "@/types/game";

const EDITION_OPTIONS = GAME_EDITIONS.map((edition) => ({
	value: edition,
	label: EDITION_LABELS[edition],
}));

export default function NewGameSettingsScreen() {
	const colors = useColors();
	const styles = useStyles(colors);
	const defaultEdition = usePreferencesStore((s) => s.defaultEdition);
	const defaultExtensions = usePreferencesStore((s) => s.defaultExtensions);
	const setDefaultEdition = usePreferencesStore((s) => s.setDefaultEdition);
	const setDefaultExtensions = usePreferencesStore((s) => s.setDefaultExtensions);
	const packs = useWondersStore((s) => s.packs);
	const setDefaultPackIds = useWondersStore((s) => s.setDefaultPackIds);
	const defaultPackIds = useMemo(
		() => packs.filter((p) => p.selectedByDefault).map((p) => p.id),
		[packs],
	);
	const warning = getExtensionsWarning(defaultExtensions);

	return (
		<ScreenContainer>
			<ScrollView contentContainerStyle={styles.content}>
				<Text style={styles.hint}>
					Cette édition et ces extensions sont pré-choisies automatiquement à la création d'une
					nouvelle partie. L'édition filtre les extensions proposées.
				</Text>
				<RadioGroup options={EDITION_OPTIONS} value={defaultEdition} onChange={setDefaultEdition} />
				<CheckboxGroup<ExtensionId>
					options={getAvailableExtensions(defaultEdition).map((ext) => ({
						value: ext,
						label: EXTENSION_LABELS[ext],
					}))}
					values={defaultExtensions}
					onChange={setDefaultExtensions}
				/>
				{warning && <Text style={styles.warning}>{warning}</Text>}
				<WonderPacksPicker
					values={defaultPackIds}
					onChange={setDefaultPackIds}
					style={styles.packs}
				/>
			</ScrollView>
		</ScreenContainer>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				content: {
					gap: SPACING.sm,
				},
				hint: {
					color: colors.textMuted,
					fontSize: 13,
				},
				warning: {
					color: colors.danger,
					fontSize: 13,
				},
				packs: {
					marginTop: SPACING.sm,
				},
			}),
		[colors],
	);
}
