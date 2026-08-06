import { StyleSheet, Text, View } from "react-native";
import { NumberStepper } from "@/components/ui/NumberStepper";
import { COLORS } from "@/constants/theme";

type Props = {
	coins: number;
	onChange: (coins: number) => void;
};

export function TreasuryFields({ coins, onChange }: Props) {
	return (
		<View style={styles.row}>
			<Text style={styles.label}>Pièces</Text>
			<NumberStepper value={coins} onChange={onChange} min={0} accentColor={COLORS.gold} />
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
