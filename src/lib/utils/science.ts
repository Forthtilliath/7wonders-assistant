import {
  addValueIntoMax,
  addValueIntoMin,
  containsNegativeValue,
} from '@helpers';

export type ScienceSymbol = 'wheel' | 'tablet' | 'compass' | 'most' | 'all';
type ScienceSymbolWithoutMost = Exclude<ScienceSymbol, 'most'>;

const DEFAULT_SCORE_TRIPLET = 7;

/**
 * Calculates the scientific score by assigning the set of all symbols to the symbol
 * that has the most copies
 *
 * @param {Object} params - The parameters for calculating the score.
 * @param {number} params.wheel - The value of the wheel symbol.
 * @param {number} params.tablet - The value of the tablet symbol.
 * @param {number} params.compass - The value of the compass symbol.
 * @param {number} params.all - The value of all science symbols.
 * @returns {number} The calculated score for the single science symbol.
 *
 * @example
 * const score = calculateScoreSolo({
 *   wheel: 2,
 *   tablet: 4,
 *   compass: 1,
 *   all: 2,
 * });
 * console.log(score); // Output: 48
 */
export function calculateScoreSolo({
  wheel,
  tablet,
  compass,
  all,
}: Record<ScienceSymbolWithoutMost, number>): number {
  [wheel, tablet, compass] = addValueIntoMax([wheel, tablet, compass], all);

  return countScienceScore(wheel, tablet, compass, DEFAULT_SCORE_TRIPLET);
}

/**
 * Calculates the score for a triplet of science symbols.
 * Calculates the scientific score by assigning the set of all symbols to have the most
 * triplet of scientific.
 *
 * @param {Object} params - The parameters for calculating the score.
 * @param {number} params.wheel - The value of the wheel symbol.
 * @param {number} params.tablet - The value of the tablet symbol.
 * @param {number} params.compass - The value of the compass symbol.
 * @param {number} params.all - The value of all science symbols.
 * @returns The calculated score for the triplet of science symbols.
 *
 * @example
 * const score = calculateScoreTriplet({
 *   wheel: 2,
 *   tablet: 3,
 *   compass: 1,
 *   all: 3,
 * });
 * // score = (2+1)^2 + 3^2 + (1+2)^2 + 3 * 7 = 9 + 9 + 9 + 21 = 48
 */
export function calculateScoreTriplet({
  wheel,
  tablet,
  compass,
  all,
}: Record<ScienceSymbolWithoutMost, number>): number {
  if (containsNegativeValue([wheel, tablet, compass])) return 0;

  while (all > 0) {
    [wheel, tablet, compass] = addValueIntoMin([wheel, tablet, compass], 1);
    all--;
  }

  return countScienceScore(wheel, tablet, compass, DEFAULT_SCORE_TRIPLET);
}

/**
 * Calculates the maximum score between two different scoring methods based on science symbols and their corresponding values.
 *
 * @param symbols - An object containing the values of science symbols.
 * @returns The maximum score between the score calculated using the `calculateScoreSolo` method and the score calculated using the `calculateScoreTriplet` method.
 */
export function calculateScores({
  wheel,
  tablet,
  compass,
  most,
  all,
}: Record<ScienceSymbol, string>) {
  let iWheel = parseInt(wheel, 10);
  let iTablet = parseInt(tablet, 10);
  let iCompass = parseInt(compass, 10);

  const iMost = parseInt(most, 10);
  const iAll = parseInt(all, 10);

  if (containsNegativeValue([iWheel, iTablet, iCompass, iMost, iAll])) return 0;

  [iWheel, iTablet, iCompass] = addValueIntoMax(
    [iWheel, iTablet, iCompass],
    iMost
  );

  const scoreBySolo = calculateScoreSolo({
    wheel: iWheel,
    tablet: iTablet,
    compass: iCompass,
    all: iAll,
  });

  const scoreByTriplet = calculateScoreTriplet({
    wheel: iWheel,
    tablet: iTablet,
    compass: iCompass,
    all: iAll,
  });

  return Math.max(scoreBySolo, scoreByTriplet);
}

/**
 * Calculates the score based on the number of science symbols (wheel, tablet, compass) and a score multiplier (scoreTriple).
 * The score is calculated using the formula: the sum of the squares of the science symbols plus the minimum value among the symbols multiplied by the score multiplier.
 *
 * @param wheel - The number of wheel science symbols.
 * @param tablet - The number of tablet science symbols.
 * @param compass - The number of compass science symbols.
 * @param scoreTriplet - The score multiplier for the minimum symbol.
 * @returns The calculated score based on the inputs.
 *
 * @example
 * const wheel = 3;
 * const tablet = 2;
 * const compass = 4;
 * const scoreTriple = 7;
 *
 * const score = countScienceScore(wheel, tablet, compass, scoreTriple);
 * console.log(score); // Output: 74
 */
export function countScienceScore(
  wheel: number,
  tablet: number,
  compass: number,
  scoreTriplet: number
): number {
  if (containsNegativeValue([wheel, tablet, compass, scoreTriplet])) return 0;

  return (
    Math.pow(wheel, 2) +
    Math.pow(tablet, 2) +
    Math.pow(compass, 2) +
    Math.min(wheel, tablet, compass) * scoreTriplet
  );
}
