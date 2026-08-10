import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { PlayerForm } from "@/components/players/PlayerForm";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { hasDuplicateName } from "@/lib/players";
import { createId } from "@/lib/uuid";
import { usePlayersStore } from "@/stores/playersStore";

export default function NewPlayerScreen() {
	const router = useRouter();
	const addPlayer = usePlayersStore((s) => s.addPlayer);
	// Généré ici (avant même la saisie) plutôt que par addPlayer, pour que la couleur d'avatar
	// affichée pendant la création (dérivée de cet id, cf. PlayerForm) soit déjà la couleur finale
	// du joueur au lieu de changer une fois le formulaire validé.
	const [playerId] = useState(() => createId());

	return (
		<ScreenContainer>
			<PlayerForm
				playerId={playerId}
				submitLabel="Créer le joueur"
				onSubmit={({ name, avatarUri }) => {
					const isDuplicate = hasDuplicateName(usePlayersStore.getState().players, name);
					addPlayer({ id: playerId, name, avatarUri });

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
