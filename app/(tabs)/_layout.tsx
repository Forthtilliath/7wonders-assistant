import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ColorValue } from "react-native";
import { headerTitleStyle } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

function tabIcon(name: IconName) {
	// Couleurs du thème, toujours des chaînes : le `ColorValue` de RN 0.88 est plus large que celui
	// attendu par @expo/vector-icons (string | OpaqueColorValue).
	return ({ color, size }: { color: ColorValue; size: number }) => (
		<MaterialCommunityIcons name={name} color={color as string} size={size} />
	);
}

export default function TabsLayout() {
	const colors = useColors();

	return (
		<Tabs
			screenOptions={{
				headerStyle: {
					backgroundColor: colors.surface,
					borderBottomWidth: 1,
					borderBottomColor: colors.border,
				},
				headerShadowVisible: false,
				headerTintColor: colors.gold,
				headerTitleStyle: headerTitleStyle(colors),
				tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
				tabBarActiveTintColor: colors.gold,
				tabBarInactiveTintColor: colors.textMuted,
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "7 Wonders",
					tabBarLabel: "Jouer",
					tabBarIcon: tabIcon("pillar"),
				}}
			/>
			<Tabs.Screen
				name="players"
				options={{ title: "Joueurs", tabBarIcon: tabIcon("account-group") }}
			/>
			<Tabs.Screen
				name="history"
				options={{ title: "Historique", tabBarIcon: tabIcon("script-text-outline") }}
			/>
			<Tabs.Screen
				name="stats"
				options={{ title: "Statistiques", tabBarIcon: tabIcon("chart-bar") }}
			/>
			<Tabs.Screen
				name="settings"
				options={{ title: "Réglages", headerShown: false, tabBarIcon: tabIcon("cog") }}
			/>
			<Tabs.Screen
				name="game"
				options={{
					headerShown: false,
					// Pas de bouton dédié : cet onglet n'est atteint que via "Lancer la partie" depuis
					// l'onglet Jouer, mais reste dans le même Tabs pour garder la barre visible.
					href: null,
				}}
			/>
		</Tabs>
	);
}
