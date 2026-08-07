import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { COLORS } from "@/constants/theme";

export default function RootLayout() {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SafeAreaProvider>
				<StatusBar style="light" />
				<ErrorBoundary>
					<Stack
						screenOptions={{
							headerStyle: { backgroundColor: COLORS.surface },
							headerTintColor: COLORS.text,
							headerTitleStyle: { color: COLORS.text },
							contentStyle: { backgroundColor: COLORS.background },
						}}
					>
						<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
						<Stack.Screen
							name="players/new"
							options={{ title: "Nouveau joueur", presentation: "modal" }}
						/>
						<Stack.Screen
							name="players/[id]"
							options={{ title: "Modifier le joueur", presentation: "modal" }}
						/>
						<Stack.Screen name="game/score/[category]" options={{ title: "Score" }} />
						<Stack.Screen
							name="game/results"
							options={{ title: "Résultats", headerBackVisible: false }}
						/>
						<Stack.Screen name="history/[id]" options={{ title: "Détail de la partie" }} />
					</Stack>
				</ErrorBoundary>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	);
}
