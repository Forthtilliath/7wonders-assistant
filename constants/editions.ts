import { EXTENSION_LABELS, EXTENSION_ORDER } from "@/constants/categories";
import type { ExtensionId, GameEdition } from "@/types/game";

export const GAME_EDITIONS: GameEdition[] = ["first", "second"];

export const EDITION_LABELS: Record<GameEdition, string> = {
	first: "1re édition",
	second: "2e édition",
};

/**
 * Extensions jouables avec chaque édition du jeu de base. Babel n'existe que pour la 1re édition
 * (2010). Edifice, sortie pour la 2e, se joue aussi avec la 1re puisqu'elle n'ajoute aucune carte
 * (le dos des cartes diffère d'une édition à l'autre). Leaders, Cités et Armada existent dans les
 * deux éditions.
 */
const EDITION_EXTENSIONS: Record<GameEdition, readonly ExtensionId[]> = {
	first: ["leaders", "cities", "babel", "armada", "edifice"],
	second: ["leaders", "cities", "armada", "edifice"],
};

/** Extensions proposées pour une édition, dans l'ordre d'affichage. */
export function getAvailableExtensions(edition: GameEdition): ExtensionId[] {
	return EXTENSION_ORDER.filter((ext) => EDITION_EXTENSIONS[edition].includes(ext));
}

/** Retire d'une sélection les extensions qui ne se jouent pas avec l'édition choisie. */
export function keepAvailableExtensions(
	extensions: readonly ExtensionId[],
	edition: GameEdition,
): ExtensionId[] {
	return extensions.filter((ext) => EDITION_EXTENSIONS[edition].includes(ext));
}

/**
 * Avertissement (non bloquant) quand la sélection mélange Babel et Edifice : Edifice remplace
 * Babel, les deux ne se jouent normalement pas ensemble. `null` si rien à signaler.
 */
export function getExtensionsWarning(extensions: readonly ExtensionId[]): string | null {
	if (extensions.includes("babel") && extensions.includes("edifice")) {
		return `${EXTENSION_LABELS.edifice} remplace ${EXTENSION_LABELS.babel} : les deux ne se jouent normalement pas ensemble.`;
	}
	return null;
}
