import { addValueIntoMax, addValueIntoMin } from '@helpers';

export type ScienceSymbol = 'wheel' | 'tablet' | 'compass' | 'most' | 'all';
type ScienceSymbolWithoutMost = Exclude<ScienceSymbol, 'most'>;

const SCORE_TRIPLET = 7;

const calculateScoreSolo = ({
  wheel,
  tablet,
  compass,
  all,
}: Record<ScienceSymbolWithoutMost, number>) => {
  [wheel, tablet, compass] = addValueIntoMax([wheel, tablet, compass], all);

  return countScienceScore(wheel, tablet, compass, SCORE_TRIPLET);
};

const calculateScoreTriplet = ({
  wheel,
  tablet,
  compass,
  all,
}: Record<ScienceSymbolWithoutMost, number>) => {
  while (all > 0) {
    [wheel, tablet, compass] = addValueIntoMin([wheel, tablet, compass], 1);
    all--;
  }

  return countScienceScore(wheel, tablet, compass, SCORE_TRIPLET);
};

export const calculateScores = ({
  wheel,
  tablet,
  compass,
  most,
  all,
}: Record<ScienceSymbol, string>) => {
  let iWheel = parseInt(wheel, 10);
  let iTablet = parseInt(tablet, 10);
  let iCompass = parseInt(compass, 10);

  const iMost = parseInt(most, 10);

  [iWheel, iTablet, iCompass] = addValueIntoMax(
    [iWheel, iTablet, iCompass],
    iMost
  );

  const iAll = parseInt(all, 10);

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
};

function countScienceScore(
  wheel: number,
  tablet: number,
  compass: number,
  scoreTriple: number
): number {
  return (
    Math.pow(wheel, 2) +
    Math.pow(tablet, 2) +
    Math.pow(compass, 2) +
    Math.min(wheel, tablet, compass) * scoreTriple
  );
}
