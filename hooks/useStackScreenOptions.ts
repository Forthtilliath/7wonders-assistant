import type { NativeStackNavigationOptions } from "expo-router";
import { useMemo } from "react";
import { headerTitleStyle } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

/** Options communes des `Stack` (racine, Jouer, Réglages) : en-tête et fond aux couleurs du thème. */
export function useStackScreenOptions(): NativeStackNavigationOptions {
	const colors = useColors();
	return useMemo(
		() => ({
			headerStyle: { backgroundColor: colors.surface },
			headerTintColor: colors.gold,
			headerTitleStyle: headerTitleStyle(colors),
			headerShadowVisible: false,
			contentStyle: { backgroundColor: colors.background },
		}),
		[colors],
	);
}
