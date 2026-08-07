import { Pressable, StyleSheet, Text } from "react-native";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";

type Props = {
	playerId: string;
	name: string;
	avatarUri?: string;
	selected: boolean;
	onPress: () => void;
};

export function SelectablePlayerCard({ playerId, name, avatarUri, selected, onPress }: Props) {
	return (
		<Pressable style={[styles.card, selected && styles.cardSelected]} onPress={onPress}>
			<PlayerAvatar name={name} avatarUri={avatarUri} seed={playerId} size={56} />
			<Text style={styles.name} numberOfLines={1}>
				{name}
			</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	card: {
		width: 84,
		alignItems: "center",
		gap: SPACING.xs,
		backgroundColor: COLORS.surface,
		borderRadius: RADIUS.md,
		borderWidth: 2,
		borderColor: "transparent",
		paddingVertical: SPACING.sm,
	},
	cardSelected: {
		borderColor: COLORS.primary,
	},
	name: {
		color: COLORS.text,
		fontSize: 13,
		maxWidth: 80,
	},
});
