import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { TextField } from "@/components/ui/TextField";
import { CustomWonderListEditor } from "@/components/wonders/CustomWonderListEditor";
import type { ThemeColors } from "@/constants/theme";
import { RADIUS, SPACING } from "@/constants/theme";
import { MAX_WONDER_PACK_NAME_LENGTH } from "@/constants/wonders";
import { useColors } from "@/hooks/useColors";
import { getWonderPackNameError } from "@/lib/wonderPacks";
import { useWondersStore } from "@/stores/wondersStore";

/** Page d'une extension non officielle : nom, activation, merveilles, suppression. */
export default function WonderPackScreen() {
	const colors = useColors();
	const styles = useStyles(colors);
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: string }>();
	const pack = useWondersStore((s) => s.packs.find((p) => p.id === id));
	const packs = useWondersStore((s) => s.packs);
	const renamePack = useWondersStore((s) => s.renamePack);
	const setDefaultPackIds = useWondersStore((s) => s.setDefaultPackIds);
	const removePack = useWondersStore((s) => s.removePack);
	const [name, setName] = useState(pack?.name ?? "");
	const [nameError, setNameError] = useState<string | null>(null);

	if (!pack) {
		return (
			<ScreenContainer>
				<Text style={styles.hint}>Extension introuvable.</Text>
			</ScreenContainer>
		);
	}

	const saveName = () => {
		if (name.trim() === pack.name) return;
		const error = getWonderPackNameError(name, packs, pack.id);
		setNameError(error);
		if (!error) renamePack(pack.id, name);
	};

	const confirmDelete = () => {
		Alert.alert(
			`Supprimer ${pack.name} ?`,
			"L'extension et ses merveilles ne seront plus proposées. Les parties déjà jouées gardent leurs merveilles.",
			[
				{ text: "Annuler", style: "cancel" },
				{
					text: "Supprimer",
					style: "destructive",
					onPress: () => {
						removePack(pack.id);
						router.back();
					},
				},
			],
		);
	};

	return (
		<ScreenContainer padded={false}>
			<ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
				<TextField
					label="Nom de l'extension"
					value={name}
					onChangeText={(text) => {
						setName(text);
						setNameError(null);
					}}
					onEndEditing={saveName}
					onSubmitEditing={saveName}
					maxLength={MAX_WONDER_PACK_NAME_LENGTH}
				/>
				{nameError && <Text style={styles.error}>{nameError}</Text>}

				<View style={styles.toggleRow}>
					<Text style={styles.toggleLabel}>Cochée par défaut pour une nouvelle partie</Text>
					<Switch
						value={pack.selectedByDefault}
						onValueChange={(selected) =>
							setDefaultPackIds(
								packs
									.filter((p) => (p.id === pack.id ? selected : p.selectedByDefault))
									.map((p) => p.id),
							)
						}
						trackColor={{ true: colors.primary, false: colors.border }}
						accessibilityLabel="Cochée par défaut pour une nouvelle partie"
					/>
				</View>

				<View style={styles.section}>
					<SectionTitle>Merveilles</SectionTitle>
					<Text style={styles.hint}>
						Colle ou tape la liste, une merveille par ligne. Les doublons (merveilles officielles ou
						déjà ajoutées) sont signalés.
					</Text>
					<CustomWonderListEditor packId={pack.id} />
				</View>

				<Button label="Supprimer l'extension" variant="danger" onPress={confirmDelete} />
			</ScrollView>
		</ScreenContainer>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				content: {
					gap: SPACING.lg,
					padding: SPACING.md,
				},
				section: {
					gap: SPACING.sm,
				},
				hint: {
					color: colors.textMuted,
					fontSize: 13,
				},
				error: {
					color: colors.danger,
					fontSize: 13,
				},
				toggleRow: {
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-between",
					gap: SPACING.md,
					paddingVertical: SPACING.sm,
					paddingHorizontal: SPACING.md,
					borderRadius: RADIUS.md,
					backgroundColor: colors.surface,
				},
				toggleLabel: {
					color: colors.text,
					fontSize: 15,
					flexShrink: 1,
				},
			}),
		[colors],
	);
}
