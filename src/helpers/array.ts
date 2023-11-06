export const flattenRoutes = (routes: Route[]): MenuItem[] => {
  const flattenedRoutes: MenuItem[] = [];

  routes.forEach((route) => {
    if (route.icon && route.path && route.label) {
      flattenedRoutes.push({
        icon: route.icon,
        label: route.label,
        path: route.path,
      });
    }

    if (route.children) {
      const childrenRoutes = flattenRoutes(route.children);
      flattenedRoutes.push(...childrenRoutes);
    }
  });

  return flattenedRoutes;
};

export const getLabelAndPrevious = (
  pathname: string,
  routes: Route[]
): { label: string | undefined; previous: boolean | undefined } => {
  let label: string | undefined;
  let previous: boolean | undefined;

  const findLabelAndPrevious = (routes: Route[]): void => {
    for (const route of routes) {
      // Échapper les caractères spéciaux de l'expression régulière
      const escapedPath = route.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // Remplacer les paramètres par des groupes de capture
      const regexPath = escapedPath.replace(/:(\w+)/g, '([^/]+)');

      // Ajouter des ancres pour correspondre à l'URL complète
      const regex = new RegExp(`^${regexPath}$`);

      if (regex.test(pathname)) {
        label = route.label;
        previous = route.previous;
        break;
      }

      if (route.children) {
        findLabelAndPrevious(route.children);
      }
    }
  };

  findLabelAndPrevious(routes);

  return { label, previous };
};

/**
 * Calculates the sum of all the numbers in the given array.
 *
 * @param arr - An array of numbers.
 * @returns The sum of all the numbers in the array.
 *
 * @example
 * const numbers = [1, 2, 3, 4, 5];
 * const result = sum(numbers);
 * console.log(result); // Output: 15
 */
export function sum(arr: number[]): number {
  return arr.reduce((total, n) => total + n, 0);
}

/**
 * Calculates the average of an array of numbers.
 *
 * @param arr - An array of numbers.
 * @returns The average of the numbers in the input array.
 *
 * @example
 * const numbers = [1, 2, 3, 4, 5];
 * const average = avg(numbers);
 * console.log(average); // Output: 3
 */
export function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  
  return sum(arr) / arr.length;
}

/**
 * Adds a value to the minimum value in an array.
 *
 * @param arr - The input array of numbers.
 * @param mod - The value to be added to the minimum value in the array.
 * @returns The modified array with the minimum value incremented by the input value.
 */
export function addValueIntoMin(arr: number[], mod: number): number[] {
  if (arr.length === 0) return [];

  const arrRes = arr.slice();

  const min = Math.min(...arrRes);
  const indexMin = arrRes.indexOf(min);
  arrRes[indexMin] += mod;

  return arrRes;
}

/**
 * Adds a value to the maximum value in an array.
 *
 * @param arr - The input array of numbers.
 * @param mod - The value to be added to the maximum value in the array.
 * @returns The modified array with the maximum value incremented by the input value.
 */
export function addValueIntoMax(arr: number[], mod: number): number[] {
  if (arr.length === 0) return [];

  const arrRes = arr.slice();

  const max = Math.max(...arrRes);
  const indexMax = arrRes.indexOf(max);
  arrRes[indexMax] += mod;

  return arrRes;
}

export function countScienceScore(
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
