import { BabelTilesField } from "@/components/game/BabelTilesField";
import { ManualPointsFields } from "@/components/game/ManualPointsFields";
import { PlayerScoreRow } from "@/components/game/PlayerScoreRow";
import { ScienceFields } from "@/components/game/ScienceFields";
import { WonderEntryFields } from "@/components/game/WonderEntryFields";
import { Button } from "@/components/ui/Button";
import { MIN_POINTS } from "@/constants/game";
import { computeBabelScore } from "@/lib/scoring/babel";
import { computeScienceScore } from "@/lib/scoring/science";
import type { CategoryId, Player, PlayerGameEntry } from "@/types/game";

// Catégories dont le score est un total de points saisi directement (jetons/cartes déjà comptés
// par le joueur), par opposition aux catégories calculées automatiquement (sciences, Babel).
const MANUAL_CATEGORIES = [
	"military",
	"treasury",
	"civilians",
	"commercials",
	"guilds",
	"leaders",
	"cities",
	"naval",
	"armada",
] as const;

type ManualCategoryId = (typeof MANUAL_CATEGORIES)[number];

// Catégories dont le total peut légitimement être négatif (jetons de défaite, dettes...). La
// merveille aussi, gérée par WonderEntryFields.
const NEGATIVE_ALLOWED: Partial<Record<ManualCategoryId, boolean>> = {
	military: true,
	treasury: true,
	cities: true,
	naval: true,
};

function isManualCategory(category: CategoryId): category is ManualCategoryId {
	return (MANUAL_CATEGORIES as readonly CategoryId[]).includes(category);
}

type Props = {
	category: CategoryId;
	player: Player;
	entry: PlayerGameEntry;
	color: string;
	onChange: (patch: (entry: PlayerGameEntry) => PlayerGameEntry) => void;
	/** Présent pour les catégories qui se comptent avec des jetons physiques (militaire, maritime). */
	onCountTokens?: () => void;
};

/** Saisie d'un joueur pour l'étape `category`, avec les champs propres à cette catégorie. */
export function CategoryEntryRow({
	category,
	player,
	entry,
	color,
	onChange,
	onCountTokens,
}: Props) {
	if (category === "scientifics") {
		return (
			<PlayerScoreRow player={player} points={computeScienceScore(entry.scientifics).total}>
				<ScienceFields
					value={entry.scientifics}
					onChange={(scientifics) => onChange((e) => ({ ...e, scientifics }))}
				/>
			</PlayerScoreRow>
		);
	}

	if (category === "wonders") {
		return (
			<PlayerScoreRow player={player}>
				<WonderEntryFields
					playerId={player.id}
					wonder={entry.wonder}
					points={entry.wonders.points}
					color={color}
					onWonderChange={(wonder) => onChange((e) => ({ ...e, wonder }))}
					onPointsChange={(points) => onChange((e) => ({ ...e, wonders: { points } }))}
				/>
			</PlayerScoreRow>
		);
	}

	if (category === "babel") {
		return (
			<PlayerScoreRow player={player} points={computeBabelScore(entry.babel.tiles)}>
				<BabelTilesField
					value={entry.babel.tiles}
					onChange={(tiles) => onChange((e) => ({ ...e, babel: { tiles } }))}
				/>
			</PlayerScoreRow>
		);
	}

	if (!isManualCategory(category)) return null;

	return (
		<PlayerScoreRow player={player}>
			<ManualPointsFields
				points={entry[category].points}
				color={color}
				min={NEGATIVE_ALLOWED[category] ? MIN_POINTS : 0}
				onChange={(points) => onChange((e) => ({ ...e, [category]: { points } }))}
			/>
			{onCountTokens && (
				<Button
					label="Compter par jetons"
					variant="ghost"
					onPress={onCountTokens}
					accessibilityLabel={`Compter les jetons de ${player.name} un par un`}
				/>
			)}
		</PlayerScoreRow>
	);
}
