import { BASE_CATEGORY_ORDER, getExtensionCategories } from "@/constants/categories";
import type { CategoryId, ExtensionId } from "@/types/game";

/** Ordre des écrans de saisie de score pour une partie donnée, extensions actives incluses. */
export function getCategoryFlow(extensions: ExtensionId[]): CategoryId[] {
	return [...BASE_CATEGORY_ORDER, ...getExtensionCategories(extensions)];
}

export function getNextCategory(current: CategoryId, extensions: ExtensionId[]): CategoryId | null {
	const flow = getCategoryFlow(extensions);
	const index = flow.indexOf(current);
	if (index === -1 || index === flow.length - 1) return null;
	return flow[index + 1];
}

export function getPreviousCategory(
	current: CategoryId,
	extensions: ExtensionId[],
): CategoryId | null {
	const flow = getCategoryFlow(extensions);
	const index = flow.indexOf(current);
	if (index <= 0) return null;
	return flow[index - 1];
}
