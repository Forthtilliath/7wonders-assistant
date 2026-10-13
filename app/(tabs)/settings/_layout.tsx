import { Stack } from "expo-router";
import { useStackScreenOptions } from "@/hooks/useStackScreenOptions";

// Stack imbriqué dans l'onglet "Réglages" (au lieu de Stack.Screen racine) pour que la barre
// d'onglets reste visible sur les sous-pages, au lieu de disparaître.
export default function SettingsLayout() {
	const screenOptions = useStackScreenOptions();

	return (
		<Stack screenOptions={screenOptions}>
			<Stack.Screen name="index" options={{ title: "Réglages" }} />
			<Stack.Screen name="appearance" options={{ title: "Apparence" }} />
			<Stack.Screen name="new-game" options={{ title: "Édition et extensions" }} />
			<Stack.Screen name="backup" options={{ title: "Gestion des sauvegardes" }} />
			<Stack.Screen name="danger-zone" options={{ title: "Zone dangereuse" }} />
			<Stack.Screen name="changelog" options={{ title: "Nouveautés" }} />
			<Stack.Screen name="donate" options={{ title: "Dons" }} />
			<Stack.Screen name="about" options={{ title: "À propos" }} />
		</Stack>
	);
}
