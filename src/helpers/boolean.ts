import { Data } from '@lib/zodSchemas';

/**
 * Checks if a given data object matches a specific version.
 *
 * @template V - The type of the version to check against.
 * @param {Data[keyof Data]} data - The data object to be checked against a specific version.
 * @param {V} version - The version to check against.
 * @returns {boolean} - Returns true if the data object matches the specified version, otherwise false.
 *
 * @example
 * import { Data } from '@lib/zodSchemas';
 *
 * const data: Data = {
 *   settings: {
 *     version: 'v1.0',
 *   },
 * };
 *
 * if (isVersion(data, 'v1.0')) {
 *   console.log('Data matches version v1.0');
 * } else {
 *   console.log('Data does not match version v1.0');
 * }
 */
export function isVersion<V extends keyof Data>(
  data: Data[keyof Data],
  version: V
): data is Data[V] {
  return data?.settings?.version === version;
}

/**
 * The function `isNumber` checks if a value is a finite number.
 * @param {unknown} value - The `value` parameter is of type `unknown`, which means it can be any type.
 * @returns a boolean value.
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * The function `isInteger` checks if a given value is an integer number.
 * @param {number} value - The parameter "value" is of type number.
 * @returns a boolean value.
 */
export function isInteger(value: number): value is IntegerNumber {
  return isNumber(value) && Number.isInteger(value);
}

/**
 * The function ``isNegative`` checks if a given number is negative.
 * @param {number} value - The parameter "value" is a number that we want to check if it is a negative
 * number.
 * @returns a boolean value.
 */
export function isNegative(value: number): value is NegativeNumber {
  return isNumber(value) && value < 0;
}

/**
 * The function `isPositive` checks if a given number is positive.
 * @param {number} value - The parameter "value" is of type number.
 * @returns a boolean value.
 */
export function isPositive(value: number): value is PositiveNumber {
  return isNumber(value) && value >= 0;
}

/**
 * The function `isPositiveInteger` checks if a given number is a positive integer.
 * @param {number} value - The parameter "value" is a number that we want to check if it is a positive
 * integer.
 * @returns a boolean value.
 */
export function isPositiveInteger(
  value: number
): value is PositiveIntegerNumber {
  return isInteger(value) && isPositive(value);
}
