import type { PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import type { Player } from "@/types/game";

type Props = PropsWithChildren<{
	player: Player;
	points?: number;
}>;

export function PlayerScoreRow({ player, points, children }: Props) {
	return (
		<View style={styles.card}>
			<View style={styles.header}>
				<PlayerAvatar name={player.name} avatarUri={player.avatarUri} size={40} />
				<Text style={styles.name} numberOfLines={1}>
					{player.name}
				</Text>
				{points !== undefined && (
					<View style={styles.badge}>
						<Text style={styles.badgeText}>{points} pts</Text>
					</View>
				)}
			</View>
			<View style={styles.content}>{children}</View>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: COLORS.surface,
		borderRadius: RADIUS.md,
		padding: SPACING.md,
		gap: SPACING.sm,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		gap: SPACING.sm,
	},
	name: {
		flex: 1,
		color: COLORS.text,
		fontSize: 16,
		fontWeight: "700",
	},
	badge: {
		backgroundColor: COLORS.surfaceAlt,
		borderRadius: RADIUS.full,
		paddingHorizontal: SPACING.sm,
		paddingVertical: 4,
	},
	badgeText: {
		color: COLORS.gold,
		fontWeight: "700",
		fontSize: 13,
	},
	content: {
		gap: SPACING.sm,
	},
});
