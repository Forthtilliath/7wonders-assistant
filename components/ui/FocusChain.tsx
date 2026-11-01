import {
	type ComponentRef,
	createContext,
	type PropsWithChildren,
	type RefObject,
	useContext,
	useEffect,
	useMemo,
	useRef,
} from "react";
import { Keyboard, type TextInput, type TextInputProps } from "react-native";

/** Instance du champ (TextInput est un composant fonction depuis RN 0.88, plus une classe). */
type TextInputInstance = ComponentRef<typeof TextInput>;

type InputRef = RefObject<TextInputInstance | null>;

type Position = { x: number; y: number };

type FocusChain = {
	register: (input: InputRef) => () => void;
	focusNext: (current: InputRef) => Promise<void>;
};

const FocusChainContext = createContext<FocusChain | null>(null);

/** Ordre de lecture : de haut en bas, puis de gauche à droite sur une même ligne. */
export function compareReadingOrder(a: Position, b: Position) {
	return Math.round(a.y) - Math.round(b.y) || a.x - b.x;
}

function measure(input: TextInputInstance) {
	return new Promise<Position>((resolve) => input.measureInWindow((x, y) => resolve({ x, y })));
}

/**
 * Délimite un groupe de champs (un écran, une feuille) dont la touche "Suivant" du clavier passe de
 * l'un à l'autre. L'ordre suit leur position à l'écran, mesurée à chaque appui, plutôt que l'ordre
 * de montage : un champ ajouté plus tard (merveille, extension activée en cours de partie) se
 * retrouve quand même à sa place.
 */
export function FocusChainProvider({ children }: PropsWithChildren) {
	const inputs = useRef(new Set<InputRef>());

	const chain = useMemo<FocusChain>(
		() => ({
			register: (input) => {
				inputs.current.add(input);
				return () => {
					inputs.current.delete(input);
				};
			},
			focusNext: async (current) => {
				const mounted = [...inputs.current].flatMap((ref) =>
					ref.current ? [{ ref, input: ref.current }] : [],
				);
				const ordered = await Promise.all(
					mounted.map(async (item) => ({ ...item, position: await measure(item.input) })),
				);
				ordered.sort((a, b) => compareReadingOrder(a.position, b.position));
				const index = ordered.findIndex((item) => item.ref === current);
				const next = index === -1 ? undefined : ordered[index + 1];
				// Dernier champ : on ferme le clavier, la saisie de l'étape est finie.
				if (next) next.input.focus();
				else Keyboard.dismiss();
			},
		}),
		[],
	);

	return <FocusChainContext.Provider value={chain}>{children}</FocusChainContext.Provider>;
}

/**
 * Branche un champ sur le `FocusChainProvider` englobant : `ref` à poser sur le `TextInput`,
 * `inputProps` à lui passer. Hors de tout groupe, le champ garde le comportement par défaut.
 */
export function useFocusChainInput() {
	const chain = useContext(FocusChainContext);
	const ref = useRef<TextInputInstance>(null);

	useEffect(() => chain?.register(ref), [chain]);

	const inputProps: Partial<TextInputProps> = chain
		? {
				returnKeyType: "next",
				// Sans ça, le clavier se fermerait à la validation pour se rouvrir aussitôt sur le
				// champ suivant.
				submitBehavior: "submit",
				onSubmitEditing: () => {
					void chain.focusNext(ref);
				},
			}
		: {};

	return { ref, inputProps };
}
