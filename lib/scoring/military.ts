import type { AgeResult, MilitaryInput } from "@/types/game";

/** Points de victoire par âge : Âge I = 1, Âge II = 3, Âge III = 5. Une défaite retire toujours 1 point. */
const WIN_POINTS_BY_AGE: readonly [number, number, number] = [1, 3, 5];
const LOSS_POINTS = -1;

function pointsForResult(result: AgeResult, ageIndex: 0 | 1 | 2): number {
	switch (result) {
		case "win":
			return WIN_POINTS_BY_AGE[ageIndex];
		case "loss":
			return LOSS_POINTS;
		case "tie":
			return 0;
	}
}

export type MilitaryResult = {
	total: number;
	/** Points obtenus pour [Âge I, Âge II, Âge III]. */
	perAge: [number, number, number];
};

/** Calcule le score militaire à partir du résultat (victoire/égalité/défaite) de chaque âge. */
export function computeMilitaryScore(input: MilitaryInput): MilitaryResult {
	const perAge: [number, number, number] = [
		pointsForResult(input.age1, 0),
		pointsForResult(input.age2, 1),
		pointsForResult(input.age3, 2),
	];
	return { total: perAge[0] + perAge[1] + perAge[2], perAge };
}
