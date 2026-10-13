import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { TextField } from "@/components/ui/TextField";
import type { ThemeColors } from "@/constants/theme";
import { RADIUS, SPACING } from "@/constants/theme";
import { MAX_WONDER_NAME_LENGTH, WONDER_SOURCE_LABELS } from "@/constants/wonders";
import { useColors } from "@/hooks/useColors";
import { getCustomWonderNameError } from "@/lib/wonders";
import { useWondersStore } from "@/stores/wondersStore";

/** Merveilles ajoutées par l'utilisateur (non affiliées à une extension officielle) : ajout et
 * suppression. */
export function CustomWondersSection() {
	const colors = useColors();
	const styles = useStyles(colors);
	const customWonders = useWondersStore((s) => s.customWonders);
	const addCustomWonder = useWondersStore((s) => s.addCustomWonder);
	const removeCustomWonder = useWondersStore((s) => s.removeCustomWonder);
	const [name, setName] = useState("");
	const [error, setError] = useState<string | null>(null);

	const sorted = useMemo(
		() => [...customWonders].sort((a, b) => a.name.localeCompare(b.name)),
		[customWonders],
	);

	const submit = () => {
		const nameError = getCustomWonderNameError(name, customWonders);
		if (nameError) {
			setError(nameError);
			return;
		}
		addCustomWonder(name);
		setName("");
		setError(null);
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
		<View style={styles.section}>
			<SectionTitle>{WONDER_SOURCE_LABELS.custom}</SectionTitle>
			<Text style={styles.note}>
				Merveilles non affiliées (contenu communautaire, promo…), proposées dans toutes les parties.
			</Text>
			{sorted.map((wonder) => (
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
				placeholder="Nouvelle merveille"
				value={name}
				onChangeText={(text) => {
					setName(text);
					setError(null);
				}}
				onSubmitEditing={submit}
				maxLength={MAX_WONDER_NAME_LENGTH}
			/>
			{error && <Text style={styles.error}>{error}</Text>}
			<Button label="Ajouter la merveille" variant="secondary" onPress={submit} />
		</View>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				section: {
					gap: SPACING.sm,
				},
				note: {
					color: colors.textMuted,
					fontSize: 12,
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
				error: {
					color: colors.danger,
					fontSize: 13,
				},
			}),
		[colors],
	);
}
