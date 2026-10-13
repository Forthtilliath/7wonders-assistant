import { renderHook } from "@testing-library/react-native";
import type { PanGesture } from "react-native-gesture-handler";
import { useSwipeGesture } from "../useSwipeGesture";

type Props = { onSwipeLeft: () => void };

/** Simule la fin d'un glissement horizontal de `translationX` px. */
function endSwipe(gesture: PanGesture, translationX: number) {
	gesture.handlers.onEnd?.({ translationX } as never, true);
}

describe("useSwipeGesture", () => {
	it("garde le même geste d'un rendu à l'autre", async () => {
		// Un geste recréé à chaque rendu est réattaché pendant l'appui en cours et peut annuler la
		// touche d'un bouton enfant (appui long du NumberStepper qui ne s'arrêtait plus).
		const { result, rerender } = await renderHook(
			({ onSwipeLeft }: Props) => useSwipeGesture({ onSwipeLeft }),
			{ initialProps: { onSwipeLeft: jest.fn() } as Props },
		);
		const first = result.current;

		await rerender({ onSwipeLeft: jest.fn() });

		expect(result.current).toBe(first);
	});

	it("appelle les actions du dernier rendu, au-delà du seuil seulement", async () => {
		const firstLeft = jest.fn();
		const lastLeft = jest.fn();
		const onSwipeRight = jest.fn();
		const { result, rerender } = await renderHook(
			({ onSwipeLeft }: Props) => useSwipeGesture({ onSwipeLeft, onSwipeRight }),
			{ initialProps: { onSwipeLeft: firstLeft } as Props },
		);
		await rerender({ onSwipeLeft: lastLeft });

		endSwipe(result.current, -30);
		expect(lastLeft).not.toHaveBeenCalled();

		endSwipe(result.current, -80);
		endSwipe(result.current, 80);
		expect(firstLeft).not.toHaveBeenCalled();
		expect(lastLeft).toHaveBeenCalledTimes(1);
		expect(onSwipeRight).toHaveBeenCalledTimes(1);
	});
});
