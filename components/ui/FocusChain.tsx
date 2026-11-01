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
	focusFirst: () => Promise<void>;
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
 *
 * `onComplete` est appelé quand on valide le dernier champ (ex. passer à l'étape suivante) et décide
 * alors du clavier ; sans lui, le clavier se ferme simplement. `autoFocusFirst` donne le focus au
 * premier champ dès l'affichage, pour enchaîner la saisie d'un écran à l'autre.
 */
export function FocusChainProvider({
	children,
	onComplete,
	autoFocusFirst = false,
}: PropsWithChildren<{ onComplete?: () => void; autoFocusFirst?: boolean }>) {
	const inputs = useRef(new Set<InputRef>());
	// Lu au moment de l'appui : la chaîne mémoïsée ne doit pas garder une version périmée.
	const onCompleteRef = useRef(onComplete);
	onCompleteRef.current = onComplete;

	const chain = useMemo(() => {
		const orderedInputs = async () => {
			const mounted = [...inputs.current].flatMap((ref) =>
				ref.current ? [{ ref, input: ref.current }] : [],
			);
			const ordered = await Promise.all(
				mounted.map(async (item) => ({ ...item, position: await measure(item.input) })),
			);
			return ordered.sort((a, b) => compareReadingOrder(a.position, b.position));
		};

		return {
			register: (input: InputRef) => {
				inputs.current.add(input);
				return () => {
					inputs.current.delete(input);
				};
			},
			focusNext: async (current: InputRef) => {
				const ordered = await orderedInputs();
				const index = ordered.findIndex((item) => item.ref === current);
				const next = index === -1 ? undefined : ordered[index + 1];
				if (next) next.input.focus();
				else if (onCompleteRef.current) onCompleteRef.current();
				// Dernier champ : la saisie du groupe est finie, on ferme le clavier.
				else Keyboard.dismiss();
			},
			focusFirst: async () => {
				const [first] = await orderedInputs();
				// Écran sans champ : on ne laisse pas le clavier ouvert sur l'écran précédent.
				if (first) first.input.focus();
				else Keyboard.dismiss();
			},
		};
	}, []);

	// Au montage seulement : les champs enfants sont déjà enregistrés (leurs effets passent avant).
	const autoFocusOnMount = useRef(autoFocusFirst);
	useEffect(() => {
		if (autoFocusOnMount.current) void chain.focusFirst();
	}, [chain]);

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
