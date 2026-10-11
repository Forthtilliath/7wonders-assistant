import type { ReactNode } from "react";
import { Text, View } from "react-native";

/**
 * Remplaçant d'expo-router pour les tests d'écran : la navigation est enregistrée par des espions
 * (`mockRouter.push`…) plutôt qu'exécutée, et `<Stack.Screen options>` rend directement le titre et
 * les boutons d'en-tête dans l'écran, pour pouvoir les presser comme le reste.
 */
export const mockRouter = {
	push: jest.fn(),
	replace: jest.fn(),
	back: jest.fn(),
	navigate: jest.fn(),
	dismissAll: jest.fn(),
	dismissTo: jest.fn(),
};

let searchParams: Record<string, string> = {};

/** Paramètres de route lus par `useLocalSearchParams` (ex. `{ id: "p1" }` pour `/players/[id]`). */
export function setSearchParams(params: Record<string, string>) {
	searchParams = params;
}

export function resetRouterMock() {
	for (const fn of Object.values(mockRouter)) fn.mockReset();
	searchParams = {};
}

export const router = mockRouter;
export const useRouter = () => mockRouter;
export const useLocalSearchParams = () => searchParams;

type ScreenOptions = { title?: string; headerRight?: () => ReactNode };

function Screen({ options }: { options?: ScreenOptions }) {
	if (!options) return null;
	return (
		<View>
			{options.title ? <Text>{options.title}</Text> : null}
			{options.headerRight?.()}
		</View>
	);
}

function Navigator({ children }: { children?: ReactNode }) {
	return <>{children}</>;
}

export const Stack = Object.assign(Navigator, { Screen });
export const Tabs = Object.assign(Navigator, { Screen });
