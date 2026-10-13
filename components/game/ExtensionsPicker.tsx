import { selectFeedback } from "@forthtilliath/react-native-kit/utils/helpers/haptics";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { EXTENSION_LABELS } from "@/constants/categories";
import {
	EDITION_LABELS,
	GAME_EDITIONS,
	getAvailableExtensions,
	getExtensionsWarning,
	keepAvailableExtensions,
} from "@/constants/editions";
import type { ThemeColors } from "@/constants/theme";
import { RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import type { ExtensionId, GameEdition } from "@/types/game";

const EDITION_OPTIONS = GAME_EDITIONS.map((edition) => ({
	value: edition,
	label: EDITION_LABELS[edition],
}));

type Props = {
	edition: GameEdition;
	extensions: ExtensionId[];
	onChange: (edition: GameEdition, extensions: ExtensionId[]) => void;
};

/**
 * Choix de l'édition du jeu puis des extensions qu'elle propose (onglet Jouer). Changer d'édition
 * décoche les extensions qu'elle ne propose pas, et un mélange déconseillé (Babel + Edifice) est
 * signalé sans être bloqué.
 */
export function ExtensionsPicker({ edition, extensions, onChange }: Props) {
	const colors = useColors();
	const styles = useStyles(colors);
	const warning = getExtensionsWarning(extensions);

	const toggleExtension = (ext: ExtensionId) => {
		selectFeedback();
		onChange(
			edition,
			extensions.includes(ext) ? extensions.filter((e) => e !== ext) : [...extensions, ext],
		);
	};

	return (
		<View style={styles.container}>
			<RadioGroup
				options={EDITION_OPTIONS}
				value={edition}
				onChange={(next) => onChange(next, keepAvailableExtensions(extensions, next))}
			/>
			<View style={styles.chipsRow}>
				{getAvailableExtensions(edition).map((ext) => {
					const active = extensions.includes(ext);
					return (
						<Pressable
							key={ext}
							style={[styles.chip, active && styles.chipActive]}
							onPress={() => toggleExtension(ext)}
							accessibilityRole="checkbox"
							accessibilityState={{ checked: active }}
							accessibilityLabel={EXTENSION_LABELS[ext]}
						>
							<Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
								{EXTENSION_LABELS[ext]}
							</Text>
						</Pressable>
					);
				})}
			</View>
			{warning && <Text style={styles.warning}>{warning}</Text>}
		</View>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				container: {
					gap: SPACING.md,
				},
				chipsRow: {
					flexDirection: "row",
					flexWrap: "wrap",
					gap: SPACING.sm,
				},
				chip: {
					paddingVertical: SPACING.sm,
					paddingHorizontal: SPACING.md,
					borderRadius: RADIUS.full,
					borderWidth: 1,
					borderColor: colors.border,
				},
				chipActive: {
					backgroundColor: colors.primary,
					borderColor: colors.primary,
				},
				chipLabel: {
					color: colors.textMuted,
				},
				chipLabelActive: {
					color: colors.primaryText,
					fontWeight: "600",
				},
				warning: {
					color: colors.danger,
					fontSize: 13,
				},
			}),
		[colors],
	);
}
