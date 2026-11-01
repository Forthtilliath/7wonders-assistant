/**
 * Version de test (semver avec identifiants de pré-release : `1.6.0-alpha.2`, `2.0.0-beta`) ?
 * Le `v` des tags git et les métadonnées de build (`+build.1`) sont ignorés.
 */
export function isPrereleaseVersion(version: string): boolean {
	const [withoutBuild = ""] = version.trim().split("+");
	return withoutBuild.includes("-");
}
