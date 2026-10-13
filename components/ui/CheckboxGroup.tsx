import {
	type CheckboxGroupOption,
	CheckboxGroup as KitCheckboxGroup,
} from "@forthtilliath/react-native-kit/components/picker/CheckboxGroup";
import { selectFeedback } from "@forthtilliath/react-native-kit/utils/helpers/haptics";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import type { ThemeColors } from "@/constants/theme";
import { RADIUS } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

type Props<T extends string> = {
	options: CheckboxGroupOption<T>[];
	values: T[];
	onChange: (values: T[]) => void;
};

/** Groupe de boutons à sélection multiple (`CheckboxGroup` de react-native-kit) aux couleurs de l'app. */
export function CheckboxGroup<T extends string>({ options, values, onChange }: Props<T>) {
	const colors = useColors();
	const styles = useStyles(colors);

	return (
		<KitCheckboxGroup
			options={options}
			values={values}
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
				chip: {
					borderRadius: RADIUS.full,
					borderColor: colors.border,
				},
				chipChecked: {
					backgroundColor: colors.primary,
					borderColor: colors.primary,
				},
				text: {
					color: colors.textMuted,
				},
				textChecked: {
					color: colors.primaryText,
				},
			}),
		[colors],
	);
}
