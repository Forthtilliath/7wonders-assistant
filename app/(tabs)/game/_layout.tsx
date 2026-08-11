import { Stack } from "expo-router";
import { useColors } from "@/hooks/useColors";

// Stack imbriqué dans l'onglet "Jouer" (au lieu d'un Stack racine) pour que la barre d'onglets
// reste visible pendant toute la saisie des scores, au lieu de disparaître.
export default function GameLayout() {
	const colors = useColors();

	return (
		<Stack
			screenOptions={{
				headerStyle: { backgroundColor: colors.surface },
				headerTintColor: colors.text,
				headerTitleStyle: { color: colors.text },
				contentStyle: { backgroundColor: colors.background },
			}}
		>
			<Stack.Screen
				name="score/[category]"
				options={{ title: "Score", animation: "slide_from_right" }}
			/>
			<Stack.Screen
				name="results"
				options={{
					title: "Résultats",
					headerBackVisible: false,
					animation: "slide_from_right",
				}}
			/>
		</Stack>
	);
}
