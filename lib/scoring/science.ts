import type { ScienceInput } from "@/types/game";

export type ScienceResult = {
	total: number;
	/** Nombre de "sets" complets (1 de chaque symbole), qui rapportent 7 points chacun. */
	setsCount: number;
	/** Répartition finale des symboles (comptés + bonus appliqués) utilisée pour le calcul optimal. */
	symbols: { compass: number; tablet: number; gear: number };
	/** Comment les symboles joker ont été répartis pour obtenir le meilleur score. */
	wildcardAllocation: { compass: number; tablet: number; gear: number };
};

function scoreForSymbols(compass: number, tablet: number, gear: number): number {
	return compass ** 2 + tablet ** 2 + gear ** 2 + 7 * Math.min(compass, tablet, gear);
}

/**
 * Applique les symboles "max" : chacun duplique automatiquement le type déjà le plus fréquent
 * (pas un choix du joueur, contrairement aux jokers). En cas d'égalité, peu importe lequel des
 * types à égalité reçoit le bonus : par symétrie, l'optimisation des jokers qui suit donnera le
 * même score final quel que soit le choix.
 */
function applyMaxSymbols(
	compass: number,
	tablet: number,
	gear: number,
	maxSymbols: number,
): { compass: number; tablet: number; gear: number } {
	let c = compass;
	let t = tablet;
	let g = gear;
	for (let i = 0; i < maxSymbols; i++) {
		if (c >= t && c >= g) c++;
		else if (t >= g) t++;
		else g++;
	}
	return { compass: c, tablet: t, gear: g };
}

/**
 * Calcule le score scientifique optimal : chaque type de symbole rapporte le carré de son nombre,
 * plus 7 points par set complet (1 roue + 1 tablette + 1 compas). Les symboles "max" dupliquent
 * d'abord le type déjà dominant (résolution automatique, sans choix), puis les symboles "joker"
 * sont répartis entre les 3 types pour maximiser le score final.
 */
export function computeScienceScore(input: ScienceInput): ScienceResult {
	const { wildcards, maxSymbols } = input;
	const base = applyMaxSymbols(input.compass, input.tablet, input.gear, maxSymbols);

	let best = {
		score: -1,
		alloc: { compass: 0, tablet: 0, gear: 0 },
	};

	for (let c = 0; c <= wildcards; c++) {
		for (let t = 0; t <= wildcards - c; t++) {
			const g = wildcards - c - t;
			const score = scoreForSymbols(base.compass + c, base.tablet + t, base.gear + g);
			if (score > best.score) {
				best = { score, alloc: { compass: c, tablet: t, gear: g } };
			}
		}
	}

	const symbols = {
		compass: base.compass + best.alloc.compass,
		tablet: base.tablet + best.alloc.tablet,
		gear: base.gear + best.alloc.gear,
	};

	return {
		total: best.score,
		setsCount: Math.min(symbols.compass, symbols.tablet, symbols.gear),
		symbols,
		wildcardAllocation: best.alloc,
	};
}
