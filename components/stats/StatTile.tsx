import { StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";

type Props = {
	label: string;
	value: string;
};

export function StatTile({ label, value }: Props) {
	return (
		<View style={styles.tile}>
			<Text style={styles.value}>{value}</Text>
			<Text style={styles.label}>{label}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	tile: {
		flex: 1,
		minWidth: 90,
		backgroundColor: COLORS.surface,
		borderRadius: RADIUS.md,
		paddingVertical: SPACING.md,
		alignItems: "center",
		gap: 2,
	},
	value: {
		color: COLORS.gold,
		fontSize: 22,
		fontWeight: "800",
	},
	label: {
		color: COLORS.textMuted,
		fontSize: 12,
		textAlign: "center",
	},
});
