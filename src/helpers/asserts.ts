export function assertsIsDefined<T>(
  val: T | null | undefined,
  errorMessage?: string
): asserts val is T {
  if (val == null) {
    throw new Error(errorMessage ?? `Variable is not defined`);
  }
}
