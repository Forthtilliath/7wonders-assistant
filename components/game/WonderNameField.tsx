import { selectFeedback } from "@forthtilliath/react-native-kit/utils/helpers/haptics";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { TextField } from "@/components/ui/TextField";
import type { ThemeColors } from "@/constants/theme";
import { RADIUS, SPACING } from "@/constants/theme";
import { MAX_WONDER_NAME_LENGTH, OFFICIAL_WONDERS } from "@/constants/wonders";
import { useColors } from "@/hooks/useColors";
import {
	getAvailableWonders,
	getCustomWonderNameError,
	getWonderNameSuggestions,
} from "@/lib/wonders";
import { useGameStore } from "@/stores/gameStore";
import { useHistoryStore } from "@/stores/historyStore";
import { useWondersStore } from "@/stores/wondersStore";

type Props = {
	/** Joueur en cours de saisie : les merveilles des autres joueurs de la partie ne lui sont pas
	 * proposées. */
	playerId: string;
	value: string;
	onChange: (name: string) => void;
};

/**
 * Champ de nom de merveille : dès qu'on tape, propose jusqu'à 5 noms qui contiennent la saisie (sans
 * casse ni accents) parmi les merveilles jouables dans la partie (édition, extensions actives,
 * merveilles perso des extensions non officielles cochées) encore libres, puis les noms déjà saisis
 * dans l'historique, pour réduire les doublons dus à des fautes de frappe dans les statistiques par
 * merveille. Un nom inconnu peut être ajouté aux merveilles perso, pour le retrouver ensuite.
 */
export function WonderNameField({ playerId, value, onChange }: Props) {
	const colors = useColors();
	const styles = useStyles(colors);
	const games = useHistoryStore((s) => s.games);
	const edition = useGameStore((s) => s.edition);
	const extensions = useGameStore((s) => s.extensions);
	const wonderPacks = useGameStore((s) => s.wonderPacks);
	const entries = useGameStore((s) => s.entries);
	const customWonders = useWondersStore((s) => s.customWonders);
	const addCustomWonder = useWondersStore((s) => s.addCustomWonder);

	const suggestions = useMemo(() => {
		const options = getAvailableWonders(edition, extensions, customWonders, wonderPacks);
		const takenNames = Object.values(entries)
			.filter((entry) => entry.playerId !== playerId)
			.map((entry) => entry.wonder.name);
		const knownNames = [...OFFICIAL_WONDERS, ...customWonders].map((w) => w.name);
		return getWonderNameSuggestions({ options, games, query: value, takenNames, knownNames });
	}, [edition, extensions, customWonders, wonderPacks, entries, playerId, games, value]);

	const canAddCustom =
		value.trim() !== "" && getCustomWonderNameError(value, customWonders) === null;

	const pick = (name: string) => {
		selectFeedback();
		onChange(name);
	};

	return (
		<View style={styles.container}>
			<TextField
				placeholder="Nom de la merveille"
				value={value}
				onChangeText={onChange}
				maxLength={MAX_WONDER_NAME_LENGTH}
			/>
			{(suggestions.length > 0 || canAddCustom) && (
				<View style={styles.suggestions}>
					{suggestions.map((name) => (
						<Pressable
							key={name}
							style={styles.suggestion}
							onPress={() => pick(name)}
							accessibilityRole="button"
							accessibilityLabel={`Utiliser le nom ${name}`}
						>
							<Text style={styles.suggestionText}>{name}</Text>
						</Pressable>
					))}
					{canAddCustom && (
						<Pressable
							style={[styles.suggestion, styles.addSuggestion]}
							onPress={() => {
								const wonder = addCustomWonder(value);
								if (wonder) pick(wonder.name);
							}}
							accessibilityRole="button"
							accessibilityLabel={`Ajouter ${value.trim()} à mes merveilles`}
						>
							<Text style={styles.addSuggestionText}>+ Ajouter « {value.trim()} »</Text>
						</Pressable>
					)}
				</View>
			)}
		</View>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				container: {
					gap: SPACING.xs,
				},
				suggestions: {
					flexDirection: "row",
					flexWrap: "wrap",
					gap: SPACING.xs,
				},
				suggestion: {
					paddingVertical: 4,
					paddingHorizontal: SPACING.sm,
					borderRadius: RADIUS.full,
					backgroundColor: colors.surfaceAlt,
				},
				suggestionText: {
					color: colors.textMuted,
					fontSize: 12,
				},
				addSuggestion: {
					backgroundColor: "transparent",
					borderWidth: 1,
					borderStyle: "dashed",
					borderColor: colors.border,
				},
				addSuggestionText: {
					color: colors.primary,
					fontSize: 12,
				},
			}),
		[colors],
	);
}
