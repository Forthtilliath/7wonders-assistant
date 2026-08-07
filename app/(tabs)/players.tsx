import { useRouter } from "expo-router";
import { useMemo } from "react";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import { GroupChip } from "@/components/groups/GroupChip";
import { PlayerListItem } from "@/components/players/PlayerListItem";
import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import type { ThemeColors } from "@/constants/theme";
import { SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { selectSortedGroups, useGroupsStore } from "@/stores/groupsStore";
import { selectSortedPlayers, usePlayersStore } from "@/stores/playersStore";

export default function PlayersScreen() {
	const router = useRouter();
	const colors = useColors();
	const styles = useStyles(colors);
	const players = usePlayersStore((s) => s.players);
	const toggleFavorite = usePlayersStore((s) => s.toggleFavorite);
	const toggleArchived = usePlayersStore((s) => s.toggleArchived);
	const groups = useGroupsStore((s) => s.groups);

	const sorted = selectSortedPlayers(players);
	const sortedGroups = selectSortedGroups(groups);

	return (
		<ScreenContainer>
			<FlatList
				data={sorted}
				keyExtractor={(p) => p.id}
				contentContainerStyle={styles.list}
				ItemSeparatorComponent={() => <Text style={{ height: SPACING.sm }} />}
				ListHeaderComponent={
					<View style={styles.groupsSection}>
						<Text style={styles.sectionTitle}>Groupes</Text>
						<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.groupsRow}>
							<View style={styles.groupsRowContent}>
								{sortedGroups.map((group) => (
									<GroupChip
										key={group.id}
										name={group.name}
										memberCount={group.playerIds.length}
										onPress={() => router.push(`/groups/${group.id}`)}
									/>
								))}
								<Button
									label="+ Nouveau groupe"
									variant="ghost"
									onPress={() => router.push("/groups/new")}
									style={styles.newGroupButton}
								/>
							</View>
						</ScrollView>
					</View>
				}
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
				groupsSection: {
					gap: SPACING.sm,
					marginBottom: SPACING.md,
				},
				sectionTitle: {
					color: colors.textMuted,
					fontSize: 14,
					textTransform: "uppercase",
					letterSpacing: 0.5,
				},
				groupsRow: {
					flexGrow: 0,
				},
				groupsRowContent: {
					flexDirection: "row",
					gap: SPACING.sm,
				},
				newGroupButton: {
					justifyContent: "center",
				},
			}),
		[colors],
	);
}
