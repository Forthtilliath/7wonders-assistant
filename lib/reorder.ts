/**
 * Déplace l'élément d'indice `from` d'un cran (`-1` vers le début, `1` vers la fin). Renvoie un
 * nouveau tableau, ou le tableau d'origine si le déplacement sortirait des bornes.
 */
export function moveItem<T>(items: readonly T[], from: number, offset: -1 | 1): T[] {
	const to = from + offset;
	if (from < 0 || from >= items.length || to < 0 || to >= items.length) return [...items];
	const next = [...items];
	[next[from], next[to]] = [next[to], next[from]];
	return next;
}
