import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text } from "react-native";
import { GameSummaryCard } from "@/components/history/GameSummaryCard";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { TextField } from "@/components/ui/TextField";
import type { ThemeColors } from "@/constants/theme";
import { SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { useHistoryStore } from "@/stores/historyStore";
import { usePlayersStore } from "@/stores/playersStore";

export default function HistoryScreen() {
	const router = useRouter();
	const colors = useColors();
	const styles = useStyles(colors);
	const games = useHistoryStore((s) => s.games);
	const players = usePlayersStore((s) => s.players);
	const [query, setQuery] = useState("");

	// Filtre par nom de joueur ayant participé à la partie (pas de titre de partie à chercher).
	const normalizedQuery = query.trim().toLowerCase();
	const filteredGames =
		normalizedQuery.length === 0
			? games
			: games.filter((game) =>
					game.playerIds.some((id) => {
						const player = players.find((p) => p.id === id);
						return player?.name.toLowerCase().includes(normalizedQuery);
					}),
				);

	return (
		<ScreenContainer>
			{games.length > 0 && (
				<TextField
					placeholder="Rechercher par joueur..."
					value={query}
					onChangeText={setQuery}
					style={styles.search}
					autoCapitalize="none"
				/>
			)}
			<FlatList
				data={filteredGames}
				keyExtractor={(g) => g.id}
				contentContainerStyle={styles.list}
				ItemSeparatorComponent={() => <Text style={{ height: SPACING.sm }} />}
				ListEmptyComponent={
					<Text style={styles.empty}>
						{normalizedQuery.length > 0
							? "Aucune partie avec ce joueur."
							: "Aucune partie enregistrée pour l'instant."}
					</Text>
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

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				search: {
					marginBottom: SPACING.md,
				},
				list: {
					paddingBottom: SPACING.md,
				},
				empty: {
					color: colors.textMuted,
					textAlign: "center",
					marginTop: SPACING.xl,
				},
			}),
		[colors],
	);
}
