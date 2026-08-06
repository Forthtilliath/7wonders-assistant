import { useRouter } from "expo-router";
import { PlayerForm } from "@/components/players/PlayerForm";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { usePlayersStore } from "@/stores/playersStore";

export default function NewPlayerScreen() {
	const router = useRouter();
	const addPlayer = usePlayersStore((s) => s.addPlayer);

	return (
		<ScreenContainer>
			<PlayerForm
				submitLabel="Créer le joueur"
				onSubmit={({ name, avatarUri }) => {
					addPlayer({ name, avatarUri });
					router.back();
				}}
			/>
		</ScreenContainer>
	);
}
