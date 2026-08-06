import { useRouter } from "expo-router";
import { FlatList, StyleSheet, Text } from "react-native";
import { GameSummaryCard } from "@/components/history/GameSummaryCard";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { COLORS, SPACING } from "@/constants/theme";
import { useHistoryStore } from "@/stores/historyStore";
import { usePlayersStore } from "@/stores/playersStore";

export default function HistoryScreen() {
	const router = useRouter();
	const games = useHistoryStore((s) => s.games);
	const players = usePlayersStore((s) => s.players);

	return (
		<ScreenContainer>
			<FlatList
				data={games}
				keyExtractor={(g) => g.id}
				contentContainerStyle={styles.list}
				ItemSeparatorComponent={() => <Text style={{ height: SPACING.sm }} />}
				ListEmptyComponent={
					<Text style={styles.empty}>Aucune partie enregistrée pour l'instant.</Text>
				}
				renderItem={({ item }) => (
					<GameSummaryCard
						game={item}
						players={players}
						onPress={() => router.push(`/history/${item.id}`)}
					/>
				)}
			/>
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	list: {
		paddingBottom: SPACING.md,
	},
	empty: {
		color: COLORS.textMuted,
		textAlign: "center",
		marginTop: SPACING.xl,
	},
});
