import { useRouter } from "expo-router";
import { useMemo } from "react";
import { FlatList, StyleSheet, Text } from "react-native";
import { PlayerListItem } from "@/components/players/PlayerListItem";
import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import type { ThemeColors } from "@/constants/theme";
import { SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { selectSortedPlayers, usePlayersStore } from "@/stores/playersStore";

export default function PlayersScreen() {
	const router = useRouter();
	const colors = useColors();
	const styles = useStyles(colors);
	const players = usePlayersStore((s) => s.players);
	const toggleFavorite = usePlayersStore((s) => s.toggleFavorite);
	const toggleArchived = usePlayersStore((s) => s.toggleArchived);

	const sorted = selectSortedPlayers(players);

	return (
		<ScreenContainer>
			<FlatList
				data={sorted}
				keyExtractor={(p) => p.id}
				contentContainerStyle={styles.list}
				ItemSeparatorComponent={() => <Text style={{ height: SPACING.sm }} />}
				ListEmptyComponent={<Text style={styles.empty}>Aucun joueur pour l'instant.</Text>}
				renderItem={({ item }) => (
					<PlayerListItem
						player={item}
						onPress={() => router.push(`/players/${item.id}`)}
						onToggleFavorite={() => toggleFavorite(item.id)}
						onToggleArchived={() => toggleArchived(item.id)}
					/>
				)}
			/>
			<Button
				label="Ajouter un joueur"
				onPress={() => router.push("/players/new")}
				style={styles.addButton}
			/>
		</ScreenContainer>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				list: {
					paddingBottom: SPACING.md,
				},
				empty: {
					color: colors.textMuted,
					textAlign: "center",
					marginTop: SPACING.xl,
				},
				addButton: {
					marginTop: SPACING.md,
				},
			}),
		[colors],
	);
}
