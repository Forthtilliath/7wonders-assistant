import { useMemo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import type { ThemeColors } from "@/constants/theme";
import { RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

type Props = {
	playerId: string;
	name: string;
	avatarUri?: string;
	selected: boolean;
	onPress: () => void;
};

export function SelectablePlayerCard({ playerId, name, avatarUri, selected, onPress }: Props) {
	const colors = useColors();
	const styles = useStyles(colors);

	return (
		<Pressable
			style={[styles.card, selected && styles.cardSelected]}
			onPress={onPress}
			accessibilityRole="checkbox"
			accessibilityState={{ checked: selected }}
			accessibilityLabel={name}
		>
			<PlayerAvatar name={name} avatarUri={avatarUri} seed={playerId} size={56} />
			<Text style={styles.name} numberOfLines={1}>
				{name}
			</Text>
		</Pressable>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				card: {
					width: 84,
					alignItems: "center",
					gap: SPACING.xs,
					backgroundColor: colors.surface,
					borderRadius: RADIUS.md,
					borderWidth: 2,
					borderColor: "transparent",
					paddingVertical: SPACING.sm,
				},
				cardSelected: {
					borderColor: colors.primary,
				},
				name: {
					color: colors.text,
					fontSize: 13,
					maxWidth: 80,
				},
			}),
		[colors],
	);
}
