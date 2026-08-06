import { StyleSheet, Text, View } from "react-native";
import { NumberStepper } from "@/components/ui/NumberStepper";
import { COLORS } from "@/constants/theme";

type Props = {
	points: number;
	onChange: (points: number) => void;
	color: string;
	min?: number;
	label?: string;
};

export function ManualPointsFields({ points, onChange, color, min = 0, label = "Points" }: Props) {
	return (
		<View style={styles.row}>
			<Text style={styles.label}>{label}</Text>
			<NumberStepper value={points} onChange={onChange} min={min} accentColor={color} />
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 12,
	},
	label: {
		flex: 1,
		flexShrink: 1,
		color: COLORS.textMuted,
	},
});
