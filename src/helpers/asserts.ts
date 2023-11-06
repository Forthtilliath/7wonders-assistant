export function assertsIsDefined<T>(
  val: T | null | undefined,
  errorMessage?: string
): asserts val is T {
  if (typeof val === 'undefined' || val === null) {
    throw new Error(errorMessage?.trim() || 'Variable is not defined');
  }
}
