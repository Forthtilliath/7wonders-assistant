import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useColors } from "@/hooks/useColors";
import { useThemeStore } from "@/stores/themeStore";

export default function RootLayout() {
	const colors = useColors();
	const mode = useThemeStore((s) => s.mode);

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SafeAreaProvider>
				<StatusBar style={mode === "light" ? "dark" : "light"} />
				<ErrorBoundary>
					<Stack
						screenOptions={{
							headerStyle: { backgroundColor: colors.surface },
							headerTintColor: colors.text,
							headerTitleStyle: { color: colors.text },
							contentStyle: { backgroundColor: colors.background },
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
						<Stack.Screen
							name="groups/new"
							options={{ title: "Nouveau groupe", presentation: "modal" }}
						/>
						<Stack.Screen
							name="groups/[id]"
							options={{ title: "Modifier le groupe", presentation: "modal" }}
						/>
						<Stack.Screen
							name="game/score/[category]"
							options={{ title: "Score", animation: "slide_from_right" }}
						/>
						<Stack.Screen
							name="game/results"
							options={{
								title: "Résultats",
								headerBackVisible: false,
								animation: "slide_from_right",
							}}
						/>
						<Stack.Screen name="history/[id]" options={{ title: "Détail de la partie" }} />
						<Stack.Screen name="settings/appearance" options={{ title: "Apparence" }} />
						<Stack.Screen name="settings/new-game" options={{ title: "Nouvelle partie" }} />
						<Stack.Screen name="settings/backup" options={{ title: "Sauvegarde" }} />
						<Stack.Screen name="settings/danger-zone" options={{ title: "Zone dangereuse" }} />
					</Stack>
				</ErrorBoundary>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	);
}
