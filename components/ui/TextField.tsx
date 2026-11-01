import {
	TextField as KitTextField,
	type TextFieldProps,
} from "@forthtilliath/react-native-kit/components/form/TextField";
import type { ComponentRef, Ref } from "react";
import type { StyleProp, TextInput, TextStyle } from "react-native";
import { RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

type Props = Omit<TextFieldProps, "colors" | "styles" | "inputRef"> & {
	/** Style du champ de saisie lui-même. */
	style?: StyleProp<TextStyle>;
	inputRef?: Ref<ComponentRef<typeof TextInput>>;
};

/** `TextField` de react-native-kit aux couleurs du thème. Sans libellé, le placeholder le nomme. */
export function TextField({ style, accessibilityLabel, inputRef, ...rest }: Props) {
	const colors = useColors();

	return (
		<KitTextField
			{...rest}
			// Le kit type encore `inputRef` avec la classe TextInput d'avant RN 0.88 : même instance.
			inputRef={inputRef as TextFieldProps["inputRef"]}
			accessibilityLabel={accessibilityLabel ?? rest.label ?? rest.placeholder}
			colors={{
				text: colors.text,
				label: colors.textMuted,
				placeholder: colors.textMuted,
				background: colors.surface,
				border: colors.border,
				borderFocused: colors.primary,
				error: colors.danger,
			}}
			styles={{
				container: { gap: SPACING.xs },
				label: { fontSize: 14, fontWeight: "400" },
				input: [
					{ borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
					style,
				],
			}}
		/>
	);
}
