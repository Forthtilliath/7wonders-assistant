import type { PropsWithChildren } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPACING } from "@/constants/theme";

type Props = PropsWithChildren<
	ViewProps & {
		scroll?: boolean;
		padded?: boolean;
	}
>;

/** Conteneur d'écran standard : fond sombre + zone sûre + padding par défaut. */
export function ScreenContainer({ children, style, padded = true, ...rest }: Props) {
	return (
		<SafeAreaView style={styles.root} edges={["bottom", "left", "right"]}>
			<View style={[padded && styles.padded, style]} {...rest}>
				{children}
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	padded: {
		flex: 1,
		padding: SPACING.md,
	},
});
