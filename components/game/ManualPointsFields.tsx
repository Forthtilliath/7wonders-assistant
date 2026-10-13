import { StyleSheet, View } from "react-native";
import { NumberStepper } from "@/components/ui/NumberStepper";
import { MAX_POINTS } from "@/constants/game";

type Props = {
	points: number;
	onChange: (points: number) => void;
	color: string;
	min?: number;
};

export function ManualPointsFields({ points, onChange, color, min = 0 }: Props) {
	return (
		<View style={styles.row}>
			<NumberStepper
				value={points}
				onChange={onChange}
				min={min}
				max={MAX_POINTS}
				accentColor={color}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		justifyContent: "center",
	},
});
