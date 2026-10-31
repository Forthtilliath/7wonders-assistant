import { ReorderList } from "@forthtilliath/react-native-kit/components/list/ReorderList";
import { selectFeedback } from "@forthtilliath/react-native-kit/utils/helpers/haptics";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import type { ThemeColors } from "@/constants/theme";
import { cardSurface, RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

type Player = { id: string; name: string; avatarUri?: string };

type Props = {
	/** Joueurs sélectionnés, dans l'ordre où ils apparaîtront pendant la saisie des scores. */
	players: Player[];
	onChange: (orderedIds: string[]) => void;
};

/** Ordre des joueurs de la partie, modifiable avec des flèches monter/descendre (`ReorderList` du kit). */
export function PlayerOrderList({ players, onChange }: Props) {
	const colors = useColors();
	const styles = useStyles(colors);

	return (
		<ReorderList
			items={players}
			keyExtractor={(player) => player.id}
			getLabel={(player) => player.name}
			onChange={(next) => onChange(next.map((player) => player.id))}
			onMoveFeedback={selectFeedback}
			renderItem={(player) => (
				<View style={styles.player}>
					<PlayerAvatar
						name={player.name}
						avatarUri={player.avatarUri}
						seed={player.id}
						size={32}
					/>
					<Text style={styles.name} numberOfLines={1}>
						{player.name}
					</Text>
				</View>
			)}
			styles={{
				list: styles.list,
				row: styles.row,
				position: styles.position,
				arrow: styles.arrow,
				arrowColor: colors.text,
			}}
		/>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				list: {
					gap: SPACING.xs,
				},
				row: {
					...cardSurface(colors),
					borderRadius: RADIUS.md,
					paddingVertical: SPACING.xs,
					paddingHorizontal: SPACING.sm,
				},
				player: {
					flexDirection: "row",
					alignItems: "center",
					gap: SPACING.sm,
				},
				position: {
					color: colors.textMuted,
					minWidth: 16,
					fontWeight: "400",
				},
				name: {
					flex: 1,
					color: colors.text,
				},
				arrow: {
					width: 40,
					height: 40,
				},
			}),
		[colors],
	);
}
