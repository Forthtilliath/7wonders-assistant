import { BottomSheet as KitBottomSheet } from "@forthtilliath/react-native-kit/components/overlay/BottomSheet";
import type { PropsWithChildren } from "react";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ThemeColors } from "@/constants/theme";
import { FONTS, RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

type Props = PropsWithChildren<{
	visible: boolean;
	onClose: () => void;
	title?: string;
}>;

/**
 * Feuille modale glissant depuis le bas (`BottomSheet` de react-native-kit) aux couleurs de l'app,
 * avec poignée et titre, qui restent visibles au défilement. Le contenu défile déjà : ne pas
 * l'envelopper dans un autre `ScrollView`.
 */
export function BottomSheet({ visible, onClose, title, children }: Props) {
	const colors = useColors();
	const styles = useStyles(colors);
	const { bottom } = useSafeAreaInsets();

	return (
		<KitBottomSheet
			visible={visible}
			onClose={onClose}
			bottomInset={bottom}
			title={title}
			showHandle
			styles={{ overlay: styles.overlay, sheet: styles.sheet }}
			headerStyles={{ handle: styles.handle, header: styles.header, title: styles.title }}
		>
			{children}
		</KitBottomSheet>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				overlay: {
					// Voile brun nuit plutôt que noir pur, dans la teinte du thème.
					backgroundColor: "rgba(12,8,4,0.65)",
				},
				sheet: {
					maxHeight: "75%",
					backgroundColor: colors.surface,
					borderTopWidth: 1,
					borderColor: colors.gold,
					borderTopLeftRadius: RADIUS.lg,
					borderTopRightRadius: RADIUS.lg,
					padding: SPACING.md,
				},
				handle: {
					borderRadius: RADIUS.full,
					backgroundColor: colors.border,
					marginBottom: SPACING.sm,
				},
				header: {
					paddingHorizontal: 0,
					paddingTop: 0,
					paddingBottom: SPACING.sm,
				},
				title: {
					color: colors.gold,
					fontFamily: FONTS.displayBold,
					fontWeight: "normal",
					fontSize: 17,
				},
			}),
		[colors],
	);
}
