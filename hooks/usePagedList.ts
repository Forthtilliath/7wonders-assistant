import { useCallback, useRef, useState } from "react";
import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from "react-native";

type Options = {
	/** Éléments ajoutés à chaque tranche (et affichés d'emblée). */
	pageSize?: number;
	/** Distance au bas du contenu (px) à partir de laquelle la tranche suivante s'affiche. */
	threshold?: number;
};

const DEFAULT_PAGE_SIZE = 5;
const DEFAULT_THRESHOLD = 200;

/**
 * Défilement infini sur une liste déjà en mémoire : n'affiche d'abord que `pageSize` éléments, puis
 * la tranche suivante quand on approche du bas du ScrollView (étaler `scrollProps` dessus). Un
 * contenu trop court pour défiler se complète tout seul jusqu'à remplir l'écran.
 */
export function usePagedList<T>(
	items: readonly T[],
	{ pageSize = DEFAULT_PAGE_SIZE, threshold = DEFAULT_THRESHOLD }: Options = {},
) {
	const [limit, setLimit] = useState(pageSize);
	const viewport = useRef({ height: 0, offset: 0, content: 0 });
	// Tranche demandée mais pas encore mesurée : la hauteur de contenu connue est périmée, un
	// défilement entre-temps en réclamerait une deuxième.
	const awaitingContent = useRef(false);
	const hasMore = limit < items.length;

	const loadMoreIfNearBottom = useCallback(() => {
		const { height, offset, content } = viewport.current;
		// Rien de mesuré (premier layout avant le contenu) : pas de quoi juger qu'on est en bas.
		const measured = height > 0 && content > 0;
		const nearBottom = measured && height + offset >= content - threshold;
		if (!nearBottom || !hasMore || awaitingContent.current) return;
		awaitingContent.current = true;
		setLimit(limit + pageSize);
	}, [hasMore, limit, pageSize, threshold]);

	const onScroll = useCallback(
		({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
			viewport.current = {
				height: nativeEvent.layoutMeasurement.height,
				offset: nativeEvent.contentOffset.y,
				content: nativeEvent.contentSize.height,
			};
			loadMoreIfNearBottom();
		},
		[loadMoreIfNearBottom],
	);

	const onLayout = useCallback(
		({ nativeEvent }: LayoutChangeEvent) => {
			viewport.current.height = nativeEvent.layout.height;
			loadMoreIfNearBottom();
		},
		[loadMoreIfNearBottom],
	);

	const onContentSizeChange = useCallback(
		(_width: number, height: number) => {
			viewport.current.content = height;
			awaitingContent.current = false;
			loadMoreIfNearBottom();
		},
		[loadMoreIfNearBottom],
	);

	return {
		visibleItems: items.slice(0, limit),
		hasMore,
		scrollProps: { onScroll, onLayout, onContentSizeChange, scrollEventThrottle: 100 },
	};
}
