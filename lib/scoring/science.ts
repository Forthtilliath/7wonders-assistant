import type { ScienceInput } from "@/types/game";

export type ScienceResult = {
	total: number;
	/** Nombre de "sets" complets (1 de chaque symbole), qui rapportent 7 points chacun. */
	setsCount: number;
	/** Répartition finale des symboles (comptés + jokers alloués) utilisée pour le calcul optimal. */
	symbols: { compass: number; tablet: number; gear: number };
	/** Comment les symboles joker ont été répartis pour obtenir le meilleur score. */
	wildcardAllocation: { compass: number; tablet: number; gear: number };
};

function scoreForSymbols(compass: number, tablet: number, gear: number): number {
	return compass ** 2 + tablet ** 2 + gear ** 2 + 7 * Math.min(compass, tablet, gear);
}

/**
 * Calcule le score scientifique optimal : chaque type de symbole rapporte le carré de son nombre,
 * plus 7 points par set complet (1 roue + 1 tablette + 1 compas). Les symboles "joker" (guildes,
 * effets de meneurs, etc.) sont répartis automatiquement entre les 3 types pour maximiser le score.
 */
export function computeScienceScore(input: ScienceInput): ScienceResult {
	const { compass, tablet, gear, wildcards } = input;

	let best = {
		score: -1,
		alloc: { compass: 0, tablet: 0, gear: 0 },
	};

	for (let c = 0; c <= wildcards; c++) {
		for (let t = 0; t <= wildcards - c; t++) {
			const g = wildcards - c - t;
			const score = scoreForSymbols(compass + c, tablet + t, gear + g);
			if (score > best.score) {
				best = { score, alloc: { compass: c, tablet: t, gear: g } };
			}
		}
	}

	const symbols = {
		compass: compass + best.alloc.compass,
		tablet: tablet + best.alloc.tablet,
		gear: gear + best.alloc.gear,
	};

	return {
		total: best.score,
		setsCount: Math.min(symbols.compass, symbols.tablet, symbols.gear),
		symbols,
		wildcardAllocation: best.alloc,
	};
}
