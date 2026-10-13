import { RadioGroup } from "@/components/ui/RadioGroup";
import { BABEL_TILE_COUNTS } from "@/lib/scoring/babel";
import type { BabelTileCount } from "@/types/game";

type Props = {
	value: BabelTileCount;
	onChange: (tiles: BabelTileCount) => void;
};

const OPTIONS = BABEL_TILE_COUNTS.map((tiles) => ({
	value: String(tiles),
	label: tiles === 0 ? "Aucune" : `${tiles} tuile${tiles > 1 ? "s" : ""}`,
}));

/** Nombre de tuiles Babel posées par un joueur ; les points en découlent (barème fixe). */
export function BabelTilesField({ value, onChange }: Props) {
	return (
		<RadioGroup
			options={OPTIONS}
			value={String(value)}
			onChange={(next) => onChange(BABEL_TILE_COUNTS.find((tiles) => String(tiles) === next) ?? 0)}
		/>
	);
}
