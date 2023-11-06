/**
 * Generates a URL with query parameters appended from a FormData object.
 * @param origin - The origin URL to which the query parameters will be appended.
 * @param args - The FormData object containing the query parameters.
 * @returns The generated URL with the query parameters appended.
 */
export function generateURL(origin: string, args: FormData): string {
  const url = new URL(origin);

  Array.from(args).forEach(([key, values]) => {
    if (Array.isArray(values)) {
      values.forEach((value) => url.searchParams.append(key, value));
    } else {
      url.searchParams.append(key, values as string);
    }
  });

  return url.toString();
}

/**
 * Capitalizes the first character of a string.
 * @param str - The input string.
 * @returns The input string with the first character capitalized.
 */
export function capitalize(str: string): string {
  const firstChar = str.charAt(0).toUpperCase();
  const remainingChars = str.slice(1);
  return firstChar + remainingChars;
}

/**
 * Generates a VersionObject from a version string.
 *
 * @param version - The input string representing a version number in the format "major.minor.patch".
 * @returns An object with `major`, `minor`, and `patch` properties representing the version number.
 *
 * @example
 * const versionString = "1.2.3";
 * const versionObject = generateVersionObject(versionString);
 * console.log(versionObject); // { major: 1, minor: 2, patch: 3 }
 */
export function generateVersionObject(version: string) {
  const [major = 0, minor = 0, patch = 0] = version.split('.').map(Number);
  return { major, minor, patch };
}
