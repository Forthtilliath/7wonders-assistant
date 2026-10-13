import { ManualPointsFields } from "@/components/game/ManualPointsFields";
import { WonderNameField } from "@/components/game/WonderNameField";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { MIN_POINTS } from "@/constants/game";
import type { PlayerGameEntry } from "@/types/game";

type Wonder = PlayerGameEntry["wonder"];

type Props = {
	playerId: string;
	wonder: Wonder;
	points: number;
	color: string;
	onWonderChange: (wonder: Wonder) => void;
	onPointsChange: (points: number) => void;
};

/** Saisie de l'étape Merveille : nom et face de la merveille jouée (pure info), puis ses points. */
export function WonderEntryFields({
	playerId,
	wonder,
	points,
	color,
	onWonderChange,
	onPointsChange,
}: Props) {
	return (
		<>
			<WonderNameField
				playerId={playerId}
				value={wonder.name}
				onChange={(name) => onWonderChange({ ...wonder, name })}
			/>
			<RadioGroup
				options={[
					{ value: "A", label: "Face A" },
					{ value: "B", label: "Face B" },
				]}
				value={wonder.side}
				onChange={(side) => onWonderChange({ ...wonder, side })}
			/>
			{/* Une merveille peut coûter des points (effets négatifs de certaines faces). */}
			<ManualPointsFields
				points={points}
				color={color}
				min={MIN_POINTS}
				onChange={onPointsChange}
			/>
		</>
	);
}
