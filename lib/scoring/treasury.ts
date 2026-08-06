/** 1 point de victoire tous les 3 pièces (arrondi à l'inférieur). */
export function computeTreasuryScore(coins: number): number {
	return Math.floor(Math.max(0, coins) / 3);
}
