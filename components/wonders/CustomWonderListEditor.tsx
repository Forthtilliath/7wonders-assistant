import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import type { ThemeColors } from "@/constants/theme";
import { RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { parseWonderNameList } from "@/lib/wonderPacks";
import { useWondersStore } from "@/stores/wondersStore";

type Props = {
	/** Extension non officielle éditée ; absente pour les merveilles perso sans extension. */
	packId?: string;
};

/**
 * Merveilles perso d'une extension non officielle (ou sans extension) : liste avec suppression, et
 * ajout d'une ou plusieurs merveilles à la fois (une par ligne, pratique pour coller la liste d'une
 * grosse extension comme la Wonders Box).
 */
export function CustomWonderListEditor({ packId }: Props) {
	const colors = useColors();
	const styles = useStyles(colors);
	const customWonders = useWondersStore((s) => s.customWonders);
	const addCustomWonders = useWondersStore((s) => s.addCustomWonders);
	const removeCustomWonder = useWondersStore((s) => s.removeCustomWonder);
	const [text, setText] = useState("");
	const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);

	const wonders = useMemo(
		() =>
			customWonders.filter((w) => w.packId === packId).sort((a, b) => a.name.localeCompare(b.name)),
		[customWonders, packId],
	);

	const submit = () => {
		const names = parseWonderNameList(text);
		if (names.length === 0) {
			setFeedback({ message: "Indique le nom de la merveille.", isError: true });
			return;
		}
		const { accepted, rejected } = addCustomWonders(names, packId);
		if (rejected.length === 0) {
			setText("");
			setFeedback(
				accepted.length > 1
					? { message: `${accepted.length} merveilles ajoutées.`, isError: false }
					: null,
			);
			return;
		}
		// Ne garde dans le champ que les noms écartés, pour les corriger.
		setText(rejected.map((r) => r.name).join("\n"));
		const details = rejected.map((r) => `${r.name} : ${r.reason}`).join("\n");
		const added = accepted.length > 0 ? `${accepted.length} ajoutée(s). ` : "";
		setFeedback({ message: `${added}Non ajoutée(s) :\n${details}`, isError: true });
	};

	const confirmRemove = (id: string, wonderName: string) => {
		Alert.alert(
			`Supprimer ${wonderName} ?`,
			"Elle ne sera plus proposée à la saisie. Les parties déjà jouées avec elle la gardent.",
			[
				{ text: "Annuler", style: "cancel" },
				{ text: "Supprimer", style: "destructive", onPress: () => removeCustomWonder(id) },
			],
		);
	};

	return (
		<View style={styles.container}>
			{wonders.map((wonder) => (
				<View key={wonder.id} style={styles.row}>
					<Text style={styles.rowText}>{wonder.name}</Text>
					<Pressable
						onPress={() => confirmRemove(wonder.id, wonder.name)}
						hitSlop={12}
						accessibilityRole="button"
						accessibilityLabel={`Supprimer ${wonder.name}`}
					>
						<Ionicons name="trash-outline" size={20} color={colors.textMuted} />
					</Pressable>
				</View>
			))}
			<TextField
				placeholder="Nouvelles merveilles, une par ligne"
				value={text}
				onChangeText={(value) => {
					setText(value);
					setFeedback(null);
				}}
				multiline
				style={styles.input}
			/>
			{feedback && (
				<Text style={feedback.isError ? styles.error : styles.success}>{feedback.message}</Text>
			)}
			<Button label="Ajouter" variant="secondary" onPress={submit} />
		</View>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				container: {
					gap: SPACING.sm,
				},
				row: {
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-between",
					paddingVertical: SPACING.sm,
					paddingHorizontal: SPACING.md,
					borderRadius: RADIUS.md,
					backgroundColor: colors.surface,
				},
				rowText: {
					color: colors.text,
					fontSize: 15,
					flexShrink: 1,
				},
				input: {
					minHeight: 80,
					textAlignVertical: "top",
				},
				error: {
					color: colors.danger,
					fontSize: 13,
				},
				success: {
					color: colors.textMuted,
					fontSize: 13,
				},
			}),
		[colors],
	);
}
