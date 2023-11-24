import { isNumber } from './boolean';

export function assertsIsDefined<T>(
  val: T | null | undefined,
  errorMessage?: string
): asserts val is T {
  if (typeof val === 'undefined' || val === null) {
    throw new Error(errorMessage?.trim() || 'Variable is not defined');
  }
}

/**
 * The function `assertsIsNumber` checks if a value is a number and throws an error if it is not.
 * @param {unknown} val - The parameter `val` is of type `unknown`, which means it can be any type.
 */
export function assertsIsNumber(val: unknown): asserts val is number {
  if (!isNumber(val)) {
    throw new Error(`Invalid input. The value ${val} must be a number.`);
  }
}
