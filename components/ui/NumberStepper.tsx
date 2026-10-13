import { tapFeedback } from "@forthtilliath/react-native-kit/utils/helpers/haptics";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { ThemeColors } from "@/constants/theme";
import { ON_COLOR, RADIUS } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { pickReadableText } from "@/lib/contrast";

type Props = {
	value: number;
	onChange: (value: number) => void;
	min?: number;
	max?: number;
	step?: number;
	accentColor?: string;
	/** Décrit ce que compte le stepper (ex. "Roues"), repris dans les libellés d'accessibilité des
	 * boutons +/- pour un lecteur d'écran ("Diminuer Roues" plutôt que juste "Diminuer"). */
	label?: string;
};

// Réglages de l'accélération en appui long : un premier pas immédiat, puis une répétition qui
// démarre après INITIAL_DELAY et s'accélère après ACCELERATE_AFTER pour saisir vite les grandes valeurs.
const INITIAL_DELAY_MS = 450;
const REPEAT_INTERVAL_MS = 180;
const ACCELERATE_AFTER_MS = 1200;
const FAST_INTERVAL_MS = 60;

export function NumberStepper({
	value,
	onChange,
	min = 0,
	max,
	step = 1,
	accentColor,
	label,
}: Props) {
	const clamp = (n: number) => {
		let result = n;
		if (min !== undefined) result = Math.max(min, result);
		if (max !== undefined) result = Math.min(max, result);
		return result;
	};

	// Suit la valeur courante pendant une répétition, indépendamment des re-renders déclenchés par
	// chaque onChange (la prop `value` du render en cours pourrait être en retard d'un tick).
	const valueRef = useRef(value);
	useEffect(() => {
		valueRef.current = value;
	}, [value]);

	const timers = useRef<{
		delay?: ReturnType<typeof setTimeout>;
		interval?: ReturnType<typeof setInterval>;
		accelerate?: ReturnType<typeof setTimeout>;
	}>({});

	const stopRepeat = () => {
		clearTimeout(timers.current.delay);
		clearInterval(timers.current.interval);
		clearTimeout(timers.current.accelerate);
		timers.current = {};
	};

	useEffect(() => {
		return () => {
			clearTimeout(timers.current.delay);
			clearInterval(timers.current.interval);
			clearTimeout(timers.current.accelerate);
		};
	}, []);

	const stepOnce = (direction: 1 | -1) => {
		const next = clamp(valueRef.current + direction * step);
		// Borne atteinte : on coupe la répétition. Sinon, si le relâchement du bouton n'arrive jamais
		// (touche annulée par un geste parent), elle tournerait sans fin en réécrivant la même valeur.
		if (next === valueRef.current) {
			stopRepeat();
			return;
		}
		tapFeedback();
		valueRef.current = next;
		onChange(next);
	};

	const startPress = (direction: 1 | -1) => {
		// Un nouvel appui sans relâchement du précédent (touche annulée puis rejouée par un geste
		// parent) écraserait les minuteries en cours : la répétition orpheline ne s'arrêterait plus.
		stopRepeat();
		stepOnce(direction);
		timers.current.delay = setTimeout(() => {
			timers.current.interval = setInterval(() => stepOnce(direction), REPEAT_INTERVAL_MS);
			timers.current.accelerate = setTimeout(() => {
				clearInterval(timers.current.interval);
				timers.current.interval = setInterval(() => stepOnce(direction), FAST_INTERVAL_MS);
			}, ACCELERATE_AFTER_MS);
		}, INITIAL_DELAY_MS);
	};

	const colors = useColors();
	const styles = useStyles(colors);
	const color = accentColor ?? colors.primary;
	// Les couleurs de catégorie vont du jaune pièce d'or au bleu nuit : +/- en encre ou en ivoire.
	const glyphStyle = [
		styles.buttonLabel,
		{ color: pickReadableText(color, ON_COLOR.light, ON_COLOR.dark) },
	];
	// "number-pad" a un clavier purement numérique, sans touche "-" sur Android. Dès qu'un
	// négatif est possible, on bascule sur "numeric" qui affiche le signe.
	const allowsNegative = min !== undefined && min < 0;

	// Texte affiché, distinct de `value` : le temps de taper "-13", l'état intermédiaire ("-",
	// "-1"...) n'est pas un nombre valide et ne doit pas être écrasé par la valeur committée.
	const [text, setText] = useState(String(value));

	useEffect(() => {
		setText(String(value));
	}, [value]);

	const commit = (raw: string) => {
		if (/^-?\d+$/.test(raw)) {
			onChange(clamp(Number.parseInt(raw, 10)));
		}
	};

	return (
		<View style={styles.row}>
			<Pressable
				style={[styles.button, { backgroundColor: color }]}
				onPressIn={() => startPress(-1)}
				onPressOut={stopRepeat}
				accessibilityRole="button"
				accessibilityLabel={label ? `Diminuer ${label}` : "Diminuer"}
			>
				<Text style={glyphStyle}>–</Text>
			</Pressable>

			<TextInput
				style={styles.value}
				keyboardType={allowsNegative ? "numeric" : "number-pad"}
				value={text}
				onChangeText={(raw) => {
					const cleaned = allowsNegative ? raw.replace(/[^\d-]/g, "") : raw.replace(/\D/g, "");
					setText(cleaned);
					commit(cleaned);
				}}
				onBlur={() => setText(String(value))}
				selectTextOnFocus
				accessibilityLabel={label}
			/>

			<Pressable
				style={[styles.button, { backgroundColor: color }]}
				onPressIn={() => startPress(1)}
				onPressOut={stopRepeat}
				accessibilityRole="button"
				accessibilityLabel={label ? `Augmenter ${label}` : "Augmenter"}
			>
				<Text style={glyphStyle}>+</Text>
			</Pressable>
		</View>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				row: {
					flexDirection: "row",
					alignItems: "center",
					gap: 8,
				},
				button: {
					width: 40,
					height: 40,
					borderRadius: RADIUS.sm,
					alignItems: "center",
					justifyContent: "center",
				},
				buttonLabel: {
					fontSize: 20,
					fontWeight: "700",
				},
				value: {
					minWidth: 48,
					textAlign: "center",
					color: colors.text,
					fontSize: 18,
					fontWeight: "700",
				},
			}),
		[colors],
	);
}
