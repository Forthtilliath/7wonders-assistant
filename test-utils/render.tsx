import { render as rntlRender } from "@testing-library/react-native";
import type { ReactElement } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

/**
 * `render` pour les écrans à geste (swipe entre étapes) : depuis gesture-handler 3, un
 * `GestureDetector` exige un `GestureHandlerRootView` parent, fourni par app/_layout.tsx dans l'app
 * mais absent quand l'écran est rendu seul.
 */
export function render(ui: ReactElement) {
	return rntlRender(ui, { wrapper: GestureHandlerRootView });
}
