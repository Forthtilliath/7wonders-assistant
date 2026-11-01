import { act, renderHook } from "@testing-library/react-native";
import { usePagedList } from "../usePagedList";

const ITEMS = Array.from({ length: 12 }, (_, i) => i);

type Hook = { current: ReturnType<typeof usePagedList<number>> };

/** Défile jusqu'à `offset` px dans une fenêtre de 500 px sur un contenu de `content` px. */
async function scrollTo(result: Hook, offset: number, content: number) {
	await act(() =>
		result.current.scrollProps.onScroll({
			nativeEvent: {
				layoutMeasurement: { height: 500 },
				contentOffset: { y: offset },
				contentSize: { height: content },
			},
		} as never),
	);
}

async function measureContent(result: Hook, height: number) {
	await act(() => result.current.scrollProps.onContentSizeChange(0, height));
}

describe("usePagedList", () => {
	it("n'affiche que la première tranche, puis la suivante près du bas", async () => {
		const { result } = await renderHook(() => usePagedList(ITEMS));
		expect(result.current.visibleItems).toEqual([0, 1, 2, 3, 4]);

		await scrollTo(result, 100, 1500);
		expect(result.current.visibleItems).toHaveLength(5);

		await scrollTo(result, 900, 1500);
		expect(result.current.visibleItems).toHaveLength(10);
		expect(result.current.hasMore).toBe(true);
	});

	it("attend la mesure du nouveau contenu avant de réclamer une autre tranche", async () => {
		const { result } = await renderHook(() => usePagedList(ITEMS));

		await scrollTo(result, 900, 1500);
		await scrollTo(result, 950, 1500);
		expect(result.current.visibleItems).toHaveLength(10);

		await measureContent(result, 3000);
		await scrollTo(result, 2400, 3000);
		expect(result.current.visibleItems).toHaveLength(12);
		expect(result.current.hasMore).toBe(false);
	});

	it("complète un contenu trop court pour défiler", async () => {
		const { result } = await renderHook(() => usePagedList(ITEMS, { pageSize: 3 }));
		await act(() =>
			result.current.scrollProps.onLayout({ nativeEvent: { layout: { height: 800 } } } as never),
		);
		expect(result.current.visibleItems).toHaveLength(3);

		await measureContent(result, 400);
		expect(result.current.visibleItems).toHaveLength(6);
	});
});
