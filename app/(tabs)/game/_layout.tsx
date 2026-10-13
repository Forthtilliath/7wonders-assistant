import { Stack } from "expo-router";
import { useStackScreenOptions } from "@/hooks/useStackScreenOptions";

// Stack imbriqué dans l'onglet "Jouer" (au lieu d'un Stack racine) pour que la barre d'onglets
// reste visible pendant toute la saisie des scores, au lieu de disparaître.
export default function GameLayout() {
	const screenOptions = useStackScreenOptions();

	return (
		<Stack screenOptions={screenOptions}>
			<Stack.Screen
				name="score/[category]"
				options={{ title: "Score", animation: "slide_from_right" }}
			/>
			<Stack.Screen
				name="results"
				options={{
					title: "Résultats",
					// Bouton retour actif exprès : permet de revenir corriger une catégorie précise
					// (ex. score mal saisi) sans passer par "Annuler la partie", qui jette tout.
					animation: "slide_from_right",
				}}
			/>
		</Stack>
	);
}
