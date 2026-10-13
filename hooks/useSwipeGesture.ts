import { useMemo, useRef } from "react";
import { Gesture } from "react-native-gesture-handler";

type Handlers = {
	onSwipeLeft?: () => void;
	onSwipeRight?: () => void;
};

/** Distance horizontale (px) au-delà de laquelle un glissement compte comme un swipe. */
const SWIPE_DISTANCE = 60;

/**
 * Swipe horizontal d'écran entier, créé une seule fois. Un geste recréé à chaque rendu est
 * réattaché à la vue pendant l'appui en cours : sur Android, la touche d'un bouton enfant peut alors
 * être annulée sans relâchement, et un appui long de NumberStepper ne s'arrêtait plus. Les
 * actions passent par une ref pour rester à jour sans recréer le geste.
 * Seuils horizontaux + tolérance verticale pour ne pas voler le scroll d'une liste.
 */
export function useSwipeGesture(handlers: Handlers) {
	const handlersRef = useRef(handlers);
	handlersRef.current = handlers;

	return useMemo(
		() =>
			Gesture.Pan()
				.activeOffsetX([-20, 20])
				.failOffsetY([-15, 15])
				.runOnJS(true)
				.onEnd((event) => {
					if (event.translationX < -SWIPE_DISTANCE) {
						handlersRef.current.onSwipeLeft?.();
					} else if (event.translationX > SWIPE_DISTANCE) {
						handlersRef.current.onSwipeRight?.();
					}
				}),
		[],
	);
}
