import type { UpdateInstallCardStyles } from "@forthtilliath/expo-release-updates-ui/UpdateInstallCard";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import type { ThemeColors } from "@/constants/theme";
import { cardSurface, RADIUS } from "@/constants/theme";

/** Thème de la carte de téléchargement de l'APK, commune au bandeau et à Réglages ▸ À propos. */
export function useUpdateInstallCardStyles(colors: ThemeColors): UpdateInstallCardStyles {
	return useMemo(() => {
		const styles = StyleSheet.create({
			container: {
				alignSelf: "stretch",
				...cardSurface(colors),
				borderRadius: RADIUS.md,
			},
			title: {
				color: colors.text,
			},
			hint: {
				color: colors.textMuted,
			},
			error: {
				color: colors.danger,
			},
			retryButton: {
				backgroundColor: colors.primary,
				borderRadius: RADIUS.sm,
			},
			retryButtonText: {
				color: colors.primaryText,
			},
		});
		return { ...styles, closeButtonText: styles.hint };
	}, [colors]);
}
