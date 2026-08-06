import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { COLORS } from "@/constants/theme";

export default function RootLayout() {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SafeAreaProvider>
				<StatusBar style="light" />
				<Stack
					screenOptions={{
						headerStyle: { backgroundColor: COLORS.surface },
						headerTintColor: COLORS.text,
						headerTitleStyle: { color: COLORS.text },
						contentStyle: { backgroundColor: COLORS.background },
					}}
				>
					<Stack.Screen name="index" options={{ title: "7 Wonders" }} />
					<Stack.Screen name="players/index" options={{ title: "Joueurs" }} />
					<Stack.Screen
						name="players/new"
						options={{ title: "Nouveau joueur", presentation: "modal" }}
					/>
					<Stack.Screen
						name="players/[id]"
						options={{ title: "Modifier le joueur", presentation: "modal" }}
					/>
					<Stack.Screen name="game/new" options={{ title: "Nouvelle partie" }} />
					<Stack.Screen name="game/score/[category]" options={{ title: "Score" }} />
					<Stack.Screen
						name="game/results"
						options={{ title: "Résultats", headerBackVisible: false }}
					/>
					<Stack.Screen name="history/index" options={{ title: "Historique" }} />
					<Stack.Screen name="history/[id]" options={{ title: "Détail de la partie" }} />
					<Stack.Screen name="stats/index" options={{ title: "Statistiques" }} />
					<Stack.Screen name="settings/index" options={{ title: "Réglages" }} />
				</Stack>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	);
}
