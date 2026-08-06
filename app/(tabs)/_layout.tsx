import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { COLORS } from "@/constants/theme";

export default function TabsLayout() {
	return (
		<Tabs
			screenOptions={{
				headerStyle: { backgroundColor: COLORS.surface },
				headerTintColor: COLORS.text,
				headerTitleStyle: { color: COLORS.text },
				tabBarStyle: { backgroundColor: COLORS.surface, borderTopColor: COLORS.border },
				tabBarActiveTintColor: COLORS.primary,
				tabBarInactiveTintColor: COLORS.textMuted,
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
