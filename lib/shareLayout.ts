import { SPACING } from "@/constants/theme";

/** Largeur (dp) d'une colonne de l'image partagée : celle d'une carte sur un téléphone courant. */
export const SHARE_COLUMN_WIDTH = 360;
/** Espace entre deux cartes, le même qu'à l'écran. */
const SHARE_GAP = SPACING.sm;
const MAX_COLUMNS = 4;

/**
 * Format visé (hauteur / largeur) : un portrait 4:5. Les messageries réduisent les images à
 * ~1600 px sur leur plus grand côté : une longue bande d'une seule colonne y devient illisible,
 * une image proche du carré garde le plus de détail.
 */
const TARGET_RATIO = 1.25;

// Hauteurs approximatives (dp) des blocs, juste assez justes pour choisir le nombre de colonnes.
const CAPTION_HEIGHT = 28;
const SECTION_TITLE_HEIGHT = 40;
const RANKED_CARD_HEIGHT = 120;
const CHART_CARD_CHROME = 60;
const PIE_HEIGHT = 140;
const LEGEND_ROW_HEIGHT = 20;
const BAR_ROW_HEIGHT = 28;

type ShareContent = {
	playerCount: number;
	categoryCount: number;
	/** Avec les graphiques (répartition par joueur, comparaison par catégorie) sous le classement. */
	withCharts: boolean;
};

function estimateHeight({ playerCount, categoryCount, withCharts }: ShareContent, columns: number) {
	const rows = (count: number) => Math.ceil(count / columns);
	let height = CAPTION_HEIGHT + rows(playerCount) * RANKED_CARD_HEIGHT;
	if (withCharts) {
		const pieCard = CHART_CARD_CHROME + Math.max(PIE_HEIGHT, categoryCount * LEGEND_ROW_HEIGHT);
		const comparisonCard = CHART_CARD_CHROME + playerCount * BAR_ROW_HEIGHT;
		height +=
			2 * SECTION_TITLE_HEIGHT + rows(playerCount) * pieCard + rows(categoryCount) * comparisonCard;
	}
	return height;
}

/** Nombre de colonnes de cartes qui rapproche le plus l'image partagée du format visé. */
export function getShareColumns(content: ShareContent): number {
	let best = 1;
	let bestGap = Number.POSITIVE_INFINITY;
	for (let columns = 1; columns <= MAX_COLUMNS; columns++) {
		const ratio = estimateHeight(content, columns) / getShareWidth(columns);
		const gap = Math.abs(Math.log(ratio / TARGET_RATIO));
		if (gap < bestGap) {
			best = columns;
			bestGap = gap;
		}
	}
	return best;
}

/** Largeur (dp) du contenu de l'image pour `columns` colonnes de cartes. */
export function getShareWidth(columns: number) {
	return columns * SHARE_COLUMN_WIDTH + (columns - 1) * SHARE_GAP;
}
