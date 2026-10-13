import {
	SegmentedToggle,
	type SegmentedToggleOption,
} from "@forthtilliath/react-native-kit/components/picker/SegmentedToggle";
import { selectFeedback } from "@forthtilliath/react-native-kit/utils/helpers/haptics";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import type { ThemeColors } from "@/constants/theme";
import { RADIUS } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

type Props<T extends string> = {
	options: SegmentedToggleOption<T>[];
	/** `null` : aucune option active (ex. face de merveille pas encore choisie). */
	value: T | null;
	onChange: (value: T) => void;
};

/** Choix unique (`SegmentedToggle` de react-native-kit) aux couleurs de l'app. */
export function RadioGroup<T extends string>({ options, value, onChange }: Props<T>) {
	const colors = useColors();
	const styles = useStyles(colors);

	return (
		<SegmentedToggle
			options={options}
			// SegmentedToggle n'accepte pas `null` : une valeur qu'aucune option ne porte n'en active aucune.
			value={value as T}
			onChange={(next) => {
				selectFeedback();
				onChange(next);
			}}
			styles={styles}
		/>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				row: {
					marginBottom: 0,
				},
				button: {
					paddingHorizontal: 0,
					borderRadius: RADIUS.sm,
					borderWidth: 1.5,
					borderColor: colors.border,
				},
				buttonActive: {
					backgroundColor: colors.primary,
					borderColor: colors.primary,
				},
				text: {
					color: colors.textMuted,
					fontSize: 13,
				},
				textActive: {
					color: colors.primaryText,
				},
			}),
		[colors],
	);
}
