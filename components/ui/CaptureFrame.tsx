import { type PropsWithChildren, type Ref, useMemo } from "react";
import { type StyleProp, StyleSheet, View, type ViewStyle } from "react-native";
import type { ThemeColors } from "@/constants/theme";
import { SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

type Props = PropsWithChildren<{
	ref?: Ref<View>;
	/** Pendant la capture seulement : sans fond, l'image partagée serait un PNG transparent. */
	capturing?: boolean;
	style?: StyleProp<ViewStyle>;
}>;

/**
 * Vue capturable en image. Le fond n'est posé que pendant la capture : à l'écran, il formerait
 * un rectangle uni par-dessus le dégradé de l'écran.
 */
export function CaptureFrame({ ref, capturing, style, children }: Props) {
	const colors = useColors();
	const styles = useStyles(colors);

	return (
		<View
			ref={ref}
			collapsable={false}
			style={[styles.frame, capturing && styles.capturing, style]}
		>
			{children}
		</View>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				// Marge négative compensée par le padding : la capture a un peu d'air autour du contenu
				// sans décaler son alignement avec le reste de l'écran.
				frame: {
					padding: SPACING.sm,
					margin: -SPACING.sm,
				},
				capturing: {
					backgroundColor: colors.background,
				},
			}),
		[colors],
	);
}
