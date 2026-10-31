import {
	type ButtonColors,
	type ButtonVariant,
	Button as KitButton,
} from "@forthtilliath/react-native-kit/components/form/Button";
import { tapFeedback } from "@forthtilliath/react-native-kit/utils/helpers/haptics";
import type { StyleProp, ViewStyle } from "react-native";
import type { ThemeColors } from "@/constants/theme";
import { FONTS, RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

type Variant = "primary" | "secondary" | "danger" | "ghost";

type Props = {
	label: string;
	onPress?: () => void;
	variant?: Variant;
	disabled?: boolean;
	style?: StyleProp<ViewStyle>;
	/** Libellé lu par le lecteur d'écran, si différent du texte affiché. */
	accessibilityLabel?: string;
};

/** Variante du kit pour chacune de l'app : le bouton discret est un contour bronze. */
const KIT_VARIANT: Record<Variant, ButtonVariant> = {
	primary: "primary",
	secondary: "secondary",
	danger: "danger",
	ghost: "outline",
};

function kitColors(colors: ThemeColors): ButtonColors {
	return {
		primary: colors.primary,
		onPrimary: colors.primaryText,
		secondary: colors.surfaceAlt,
		onSecondary: colors.text,
		border: colors.border,
		danger: colors.danger,
		onDanger: colors.primaryText,
	};
}

/** `Button` de react-native-kit aux couleurs et à la police du thème, avec vibration. */
export function Button({
	label,
	onPress,
	variant = "primary",
	disabled,
	style,
	accessibilityLabel,
}: Props) {
	const colors = useColors();

	return (
		<KitButton
			label={label}
			onPress={() => {
				tapFeedback();
				onPress?.();
			}}
			variant={KIT_VARIANT[variant]}
			disabled={disabled}
			accessibilityLabel={accessibilityLabel}
			colors={kitColors(colors)}
			styles={{
				button: [
					{
						paddingVertical: SPACING.md,
						paddingHorizontal: SPACING.lg,
						borderRadius: RADIUS.md,
						borderWidth: 1,
					},
					// Liseré doré : la plaque de bronze ressort même sur un fond proche.
					variant === "primary" && { borderColor: colors.gold },
					style,
				],
				label: {
					fontFamily: FONTS.displayBold,
					fontWeight: "normal",
					fontSize: 16,
					letterSpacing: 0.6,
				},
			}}
		/>
	);
}
