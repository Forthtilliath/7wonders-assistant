import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { TextField } from "@/components/ui/TextField";
import type { ThemeColors } from "@/constants/theme";
import { RADIUS, SPACING } from "@/constants/theme";
import { MAX_WONDER_NAME_LENGTH } from "@/constants/wonders";
import { useColors } from "@/hooks/useColors";
import { renameCustomWonderEverywhere } from "@/lib/customWonderRename";
import type { CustomWonder } from "@/types/game";

type Props = {
	wonder: CustomWonder;
	onRemove: () => void;
};

/** Merveille perso de la liste : son nom, corrigeable (faute de frappe) ou supprimable. */
export function CustomWonderRow({ wonder, onRemove }: Props) {
	const colors = useColors();
	const styles = useStyles(colors);
	const [draft, setDraft] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const cancel = () => {
		setDraft(null);
		setError(null);
	};

	const save = () => {
		if (draft === null) return;
		const nextError = renameCustomWonderEverywhere(wonder.id, draft);
		setError(nextError);
		if (!nextError) setDraft(null);
	};

	if (draft !== null) {
		return (
			<View style={styles.editor}>
				<View style={styles.editRow}>
					<View style={styles.field}>
						<TextField
							value={draft}
							onChangeText={(value) => {
								setDraft(value);
								setError(null);
							}}
							onSubmitEditing={save}
							maxLength={MAX_WONDER_NAME_LENGTH}
							autoFocus
							accessibilityLabel={`Nouveau nom de ${wonder.name}`}
						/>
					</View>
					<Pressable
						onPress={save}
						hitSlop={12}
						accessibilityRole="button"
						accessibilityLabel={`Enregistrer le nom de ${wonder.name}`}
					>
						<Ionicons name="checkmark" size={22} color={colors.primary} />
					</Pressable>
					<Pressable
						onPress={cancel}
						hitSlop={12}
						accessibilityRole="button"
						accessibilityLabel="Annuler la modification"
					>
						<Ionicons name="close" size={22} color={colors.textMuted} />
					</Pressable>
				</View>
				{error && <Text style={styles.error}>{error}</Text>}
			</View>
		);
	}

	return (
		<View style={styles.row}>
			<Text style={styles.rowText}>{wonder.name}</Text>
			<View style={styles.actions}>
				<Pressable
					onPress={() => setDraft(wonder.name)}
					hitSlop={12}
					accessibilityRole="button"
					accessibilityLabel={`Renommer ${wonder.name}`}
				>
					<Ionicons name="pencil-outline" size={20} color={colors.textMuted} />
				</Pressable>
				<Pressable
					onPress={onRemove}
					hitSlop={12}
					accessibilityRole="button"
					accessibilityLabel={`Supprimer ${wonder.name}`}
				>
					<Ionicons name="trash-outline" size={20} color={colors.textMuted} />
				</Pressable>
			</View>
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
					justifyContent: "space-between",
					gap: SPACING.md,
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
				actions: {
					flexDirection: "row",
					alignItems: "center",
					gap: SPACING.lg,
				},
				editor: {
					gap: SPACING.xs,
				},
				editRow: {
					flexDirection: "row",
					alignItems: "center",
					gap: SPACING.md,
				},
				field: {
					flex: 1,
				},
				error: {
					color: colors.danger,
					fontSize: 13,
				},
			}),
		[colors],
	);
}
