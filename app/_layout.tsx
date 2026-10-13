import { Cinzel_600SemiBold } from "@expo-google-fonts/cinzel/600SemiBold";
import { Cinzel_700Bold } from "@expo-google-fonts/cinzel/700Bold";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAvatarStorage } from "@/hooks/useAvatarStorage";
import { useCloudAutoBackup } from "@/hooks/useCloudAutoBackup";
import { useColors } from "@/hooks/useColors";
import { useStackScreenOptions } from "@/hooks/useStackScreenOptions";
import { useThemeStore } from "@/stores/themeStore";

export default function RootLayout() {
	const colors = useColors();
	const screenOptions = useStackScreenOptions();
	const mode = useThemeStore((s) => s.mode);
	// Polices locales (assets du bundle), chargées en quelques millisecondes. En cas d'échec on
	// affiche quand même l'app : les titres retombent sur la police système.
	const [fontsLoaded, fontError] = useFonts({ Cinzel_600SemiBold, Cinzel_700Bold });
	useCloudAutoBackup();
	useAvatarStorage();

	if (!fontsLoaded && !fontError) {
		return <View style={{ flex: 1, backgroundColor: colors.background }} />;
	}

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SafeAreaProvider>
				<StatusBar style={mode === "light" ? "dark" : "light"} />
				<ErrorBoundary>
					<Stack screenOptions={screenOptions}>
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
						<Stack.Screen name="history/[id]" options={{ title: "Détail de la partie" }} />
					</Stack>
				</ErrorBoundary>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	);
}
