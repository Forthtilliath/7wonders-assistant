import { StyleSheet, Text, View } from "react-native";
import { NumberStepper } from "@/components/ui/NumberStepper";
import { COLORS } from "@/constants/theme";

type Props = {
	points: number;
	onChange: (points: number) => void;
	color: string;
};

export function ManualPointsFields({ points, onChange, color }: Props) {
	return (
		<View style={styles.row}>
			<Text style={styles.label}>Points</Text>
			<NumberStepper value={points} onChange={onChange} accentColor={color} />
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	label: {
		color: COLORS.textMuted,
	},
});
