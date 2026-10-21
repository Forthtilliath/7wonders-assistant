import { Ionicons } from "@expo/vector-icons";
import { selectFeedback } from "@forthtilliath/react-native-kit/utils/helpers/haptics";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import type { ThemeColors } from "@/constants/theme";
import { cardSurface, RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { moveItem } from "@/lib/reorder";

type Player = { id: string; name: string; avatarUri?: string };

type Props = {
	/** Joueurs sélectionnés, dans l'ordre où ils apparaîtront pendant la saisie des scores. */
	players: Player[];
	onChange: (orderedIds: string[]) => void;
};

/** Ordre des joueurs de la partie, modifiable avec des flèches monter/descendre. */
export function PlayerOrderList({ players, onChange }: Props) {
	const colors = useColors();
	const styles = useStyles(colors);
	const ids = players.map((p) => p.id);

	const move = (index: number, offset: -1 | 1) => {
		selectFeedback();
		onChange(moveItem(ids, index, offset));
	};

	return (
		<View style={styles.list}>
			{players.map((player, index) => (
				<View key={player.id} style={styles.row}>
					<Text style={styles.position}>{index + 1}</Text>
					<PlayerAvatar
						name={player.name}
						avatarUri={player.avatarUri}
						seed={player.id}
						size={32}
					/>
					<Text style={styles.name} numberOfLines={1}>
						{player.name}
					</Text>
					<ArrowButton
						icon="chevron-up"
						label={`Monter ${player.name}`}
						disabled={index === 0}
						onPress={() => move(index, -1)}
						styles={styles}
						color={colors.text}
					/>
					<ArrowButton
						icon="chevron-down"
						label={`Descendre ${player.name}`}
						disabled={index === players.length - 1}
						onPress={() => move(index, 1)}
						styles={styles}
						color={colors.text}
					/>
				</View>
			))}
		</View>
	);
}

type ArrowButtonProps = {
	icon: "chevron-up" | "chevron-down";
	label: string;
	disabled: boolean;
	onPress: () => void;
	styles: ReturnType<typeof useStyles>;
	color: string;
};

function ArrowButton({ icon, label, disabled, onPress, styles, color }: ArrowButtonProps) {
	return (
		<Pressable
			style={[styles.arrow, disabled && styles.arrowDisabled]}
			onPress={onPress}
			disabled={disabled}
			hitSlop={4}
			accessibilityRole="button"
			accessibilityLabel={label}
			accessibilityState={{ disabled }}
		>
			<Ionicons name={icon} size={22} color={color} />
		</Pressable>
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
					flexDirection: "row",
					alignItems: "center",
					gap: SPACING.sm,
					...cardSurface(colors),
					borderRadius: RADIUS.md,
					paddingVertical: SPACING.xs,
					paddingHorizontal: SPACING.sm,
				},
				position: {
					color: colors.textMuted,
					width: 16,
					textAlign: "center",
				},
				name: {
					flex: 1,
					color: colors.text,
				},
				arrow: {
					width: 40,
					height: 40,
					alignItems: "center",
					justifyContent: "center",
					borderRadius: RADIUS.full,
				},
				arrowDisabled: {
					opacity: 0.3,
				},
			}),
		[colors],
	);
}
