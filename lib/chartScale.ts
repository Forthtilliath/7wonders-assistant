export type BarChartScale = {
	stepValue: number;
	noOfSections: number;
	noOfSectionsBelowXAxis: number;
	maxValue: number;
	mostNegativeValue: number;
};

/**
 * Calcule une échelle cohérente (même nombre de points par section, au-dessus et en dessous de
 * l'axe) pour `react-native-gifted-charts`. Sans ça, la librairie calibre l'axe à partir des
 * seules valeurs positives : une petite moyenne (0.1) peut alors s'afficher aussi haute qu'une
 * grande valeur négative, le rendu n'étant plus proportionnel aux valeurs réelles.
 */
/** Nombre de sections au-dessus de l'axe, fixe : au-delà d'être "joli", en dessous de ça la
 * librairie sous-jacente rend un graphique vide dès que le maximum positif est nul (ex. un
 * joueur qui n'a que des catégories à 0 sauf une négative). */
const NO_OF_SECTIONS = 4;

export function computeBarChartScale(values: number[]): BarChartScale {
	const maxPositive = Math.max(0, ...values);
	const maxNegativeMagnitude = Math.max(0, ...values.map((v) => -v));
	const overallMax = Math.max(maxPositive, maxNegativeMagnitude, 1);

	const stepValue = Math.max(1, Math.ceil(overallMax / NO_OF_SECTIONS));
	const noOfSections = NO_OF_SECTIONS;
	const noOfSectionsBelowXAxis =
		maxNegativeMagnitude > 0 ? Math.ceil(maxNegativeMagnitude / stepValue) : 0;

	return {
		stepValue,
		noOfSections,
		noOfSectionsBelowXAxis,
		maxValue: noOfSections * stepValue,
		// Évite un -0 (0 * stepValue négé) quand il n'y a pas de valeur négative.
		mostNegativeValue: noOfSectionsBelowXAxis === 0 ? 0 : -(noOfSectionsBelowXAxis * stepValue),
	};
}
