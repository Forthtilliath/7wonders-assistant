/** Une dénomination de jeton de conflit (valeur en points + libellé affiché). */
export type TokenDenomination = {
	value: number;
	label: string;
};

// Jetons de conflit militaire terrestre : Victoire +1 (Âge I) / +3 (Âge II) / +5 (Âge III),
// Défaite -1 (identique à tous les âges).
export const MILITARY_TOKENS: TokenDenomination[] = [
	{ value: 1, label: "Victoire Âge I (+1)" },
	{ value: 3, label: "Victoire Âge II (+3)" },
	{ value: 5, label: "Victoire Âge III (+5)" },
	{ value: -1, label: "Défaite (−1)" },
];

// Jetons de conflit naval (extension Armada) : Défaite -1/-2/-3 selon l'âge ; Victoire +1/+3
// (Âge I), +3/+5 (Âge II), +3/+5/+7 (Âge III) selon le rang de force navale — d'où ces 4 valeurs
// de victoire distinctes (+1, +3, +5, +7) à travers la partie.
export const ARMADA_TOKENS: TokenDenomination[] = [
	{ value: 1, label: "Victoire (+1)" },
	{ value: 3, label: "Victoire (+3)" },
	{ value: 5, label: "Victoire (+5)" },
	{ value: 7, label: "Victoire (+7)" },
	{ value: -1, label: "Défaite (−1)" },
	{ value: -2, label: "Défaite (−2)" },
	{ value: -3, label: "Défaite (−3)" },
];

/** Total de points pour un jeu de dénominations et un nombre de jetons de chacune (même index). */
export function computeTokensTotal(tokens: TokenDenomination[], counts: number[]): number {
	return tokens.reduce((sum, token, index) => sum + token.value * (counts[index] ?? 0), 0);
}
