import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useColors } from "@/hooks/useColors";

export default function TabsLayout() {
	const colors = useColors();

	return (
		<Tabs
			screenOptions={{
				headerStyle: { backgroundColor: colors.surface },
				headerTintColor: colors.text,
				headerTitleStyle: { color: colors.text },
				tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
				tabBarActiveTintColor: colors.primary,
				tabBarInactiveTintColor: colors.textMuted,
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "7 Wonders",
					tabBarLabel: "Jouer",
					tabBarIcon: ({ color, size }) => <Ionicons name="play" color={color} size={size} />,
				}}
			/>
			<Tabs.Screen
				name="players"
				options={{
					title: "Joueurs",
					tabBarIcon: ({ color, size }) => <Ionicons name="people" color={color} size={size} />,
				}}
			/>
			<Tabs.Screen
				name="history"
				options={{
					title: "Historique",
					tabBarIcon: ({ color, size }) => <Ionicons name="time" color={color} size={size} />,
				}}
			/>
			<Tabs.Screen
				name="stats"
				options={{
					title: "Statistiques",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="stats-chart" color={color} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: "Réglages",
					tabBarIcon: ({ color, size }) => <Ionicons name="settings" color={color} size={size} />,
				}}
			/>
		</Tabs>
	);
}
