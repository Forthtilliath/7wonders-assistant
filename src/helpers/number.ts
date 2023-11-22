import { assertsIsNumber } from './asserts';

/**
 * The `removeLandingZero` function removes leading zeros from a number and returns a string
 * representation, with an optional default value if the result is an empty string.
 * @param {number} value - The `value` parameter is a number that you want to remove leading zeros
 * from.
 * @param [defaultValue=0] - The `defaultValue` parameter is an optional parameter that specifies the
 * value to be returned if the `value` parameter is equal to zero after removing leading zeros. If
 * `defaultValue` is not provided, it defaults to zero.
 * @returns a string value.
 */
export function removeLandingZero(value: number, defaultValue = 0): string {
  assertsIsNumber(value);
  assertsIsNumber(defaultValue);
  return value.toString().replace(/^0+/, '') || defaultValue.toString();
}
