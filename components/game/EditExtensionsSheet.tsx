import { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { CheckboxGroup } from "@/components/ui/CheckboxGroup";
import { CATEGORY_META, EXTENSION_CATEGORIES, EXTENSION_LABELS } from "@/constants/categories";
import { getAvailableExtensions, getExtensionsWarning } from "@/constants/editions";
import { getMaxPlayers } from "@/constants/game";
import type { ThemeColors } from "@/constants/theme";
import { SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import type { ExtensionId, GameEdition } from "@/types/game";

type Props = {
	visible: boolean;
	onClose: () => void;
	currentExtensions: ExtensionId[];
	/** Édition de la partie : seules les extensions qu'elle propose sont listées. */
	edition: GameEdition;
	playerCount: number;
	onConfirm: (extensions: ExtensionId[]) => void;
};

/**
 * Modification des extensions actives en cours de partie (typiquement un oubli à la création).
 * Un aperçu des catégories ajoutées/retirées s'affiche dès qu'une sélection change, et la
 * validation redemande confirmation en rappelant cet impact — retirer une extension remet à zéro
 * les points déjà saisis pour ses catégories (cf. `gameStore.updateExtensions`).
 * Retirer Cités est refusé quand la partie compte plus de joueurs que le jeu de base n'en accepte,
 * et le mélange Babel + Edifice est signalé sans être bloqué.
 */
export function EditExtensionsSheet({
	visible,
	onClose,
	currentExtensions,
	edition,
	playerCount,
	onConfirm,
}: Props) {
	const colors = useColors();
	const styles = useStyles(colors);
	const [pending, setPending] = useState<ExtensionId[]>(currentExtensions);

	useEffect(() => {
		if (visible) setPending(currentExtensions);
	}, [visible, currentExtensions]);

	const added = pending.filter((ext) => !currentExtensions.includes(ext));
	const removed = currentExtensions.filter((ext) => !pending.includes(ext));
	const hasChanges = added.length > 0 || removed.length > 0;
	const maxPlayers = getMaxPlayers(pending);
	const tooManyPlayers = playerCount > maxPlayers;
	const warning = getExtensionsWarning(pending);

	const addedCategories = added.flatMap((ext) => EXTENSION_CATEGORIES[ext]);
	const removedCategories = removed.flatMap((ext) => EXTENSION_CATEGORIES[ext]);

	const handleConfirm = () => {
		if (!hasChanges || tooManyPlayers) return;

		const lines: string[] = [];
		if (addedCategories.length > 0) {
			lines.push(`Ajoute : ${addedCategories.map((c) => CATEGORY_META[c].label).join(", ")}.`);
		}
		if (removedCategories.length > 0) {
			lines.push(
				`Retire : ${removedCategories.map((c) => CATEGORY_META[c].label).join(", ")} (les points déjà saisis pour ces catégories seront remis à zéro).`,
			);
		}
		// Edifice n'apporte aucune étape de score (ses pions et jetons se comptent avec le trésor).
		if (lines.length === 0) lines.push("Aucune étape de score n'est ajoutée ni retirée.");
		if (warning) lines.push(warning);

		Alert.alert("Modifier les extensions ?", lines.join("\n\n"), [
			{ text: "Annuler", style: "cancel" },
			{
				text: "Confirmer",
				style: removedCategories.length > 0 ? "destructive" : "default",
				onPress: () => {
					onConfirm(pending);
					onClose();
				},
			},
		]);
	};

	return (
		<BottomSheet visible={visible} onClose={onClose} title="Extensions de la partie">
			<CheckboxGroup
				options={getAvailableExtensions(edition).map((ext) => ({
					value: ext,
					label: EXTENSION_LABELS[ext],
				}))}
				values={pending}
				onChange={setPending}
			/>

			{tooManyPlayers && (
				<Text style={styles.warning}>
					{playerCount} joueurs dans la partie : {EXTENSION_LABELS.cities} ne peut pas être retirée
					(maximum {maxPlayers} sans elle).
				</Text>
			)}

			{warning && <Text style={styles.warning}>{warning}</Text>}

			{hasChanges && !tooManyPlayers && (
				<View style={styles.preview}>
					{addedCategories.length > 0 && (
						<Text style={styles.previewAdd}>
							+ {addedCategories.map((c) => CATEGORY_META[c].label).join(", ")}
						</Text>
					)}
					{removedCategories.length > 0 && (
						<Text style={styles.previewRemove}>
							− {removedCategories.map((c) => CATEGORY_META[c].label).join(", ")} (points remis à
							zéro)
						</Text>
					)}
				</View>
			)}

			<Button
				label="Valider"
				onPress={handleConfirm}
				disabled={!hasChanges || tooManyPlayers}
				style={styles.confirmButton}
			/>
		</BottomSheet>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				preview: {
					gap: SPACING.xs,
					marginTop: SPACING.md,
				},
				previewAdd: {
					color: colors.success,
					fontSize: 13,
				},
				previewRemove: {
					color: colors.danger,
					fontSize: 13,
				},
				warning: {
					color: colors.danger,
					fontSize: 13,
					marginTop: SPACING.md,
				},
				confirmButton: {
					marginTop: SPACING.md,
				},
			}),
		[colors],
	);
}
