import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { PlayerForm } from "@/components/players/PlayerForm";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { hasDuplicateName } from "@/lib/players";
import { usePlayersStore } from "@/stores/playersStore";

export default function NewPlayerScreen() {
	const router = useRouter();
	const addPlayer = usePlayersStore((s) => s.addPlayer);

	return (
		<ScreenContainer>
			<PlayerForm
				submitLabel="Créer le joueur"
				onSubmit={({ name, avatarUri }) => {
					const isDuplicate = hasDuplicateName(usePlayersStore.getState().players, name);
					addPlayer({ name, avatarUri });

					if (isDuplicate) {
						Alert.alert(
							"Un joueur du même nom existe déjà",
							"Pense à renommer l'un des deux ou à ajouter une photo pour les distinguer facilement dans les listes.",
							[{ text: "Compris", onPress: () => router.back() }],
						);
					} else {
						router.back();
					}
				}}
			/>
		</ScreenContainer>
	);
}
