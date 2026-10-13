import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SettingsRow } from "@/components/settings/SettingsRow";
import { Button } from "@/components/ui/Button";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { TextField } from "@/components/ui/TextField";
import type { ThemeColors } from "@/constants/theme";
import { SPACING } from "@/constants/theme";
import { MAX_WONDER_PACK_NAME_LENGTH } from "@/constants/wonders";
import { useColors } from "@/hooks/useColors";
import { getWonderPackNameError } from "@/lib/wonderPacks";
import { useWondersStore } from "@/stores/wondersStore";

/** Extensions non officielles de l'utilisateur : une ligne par extension (vers sa page), et création. */
export function WonderPacksSection() {
	const colors = useColors();
	const styles = useStyles(colors);
	const router = useRouter();
	const packs = useWondersStore((s) => s.packs);
	const customWonders = useWondersStore((s) => s.customWonders);
	const addPack = useWondersStore((s) => s.addPack);
	const [name, setName] = useState("");
	const [error, setError] = useState<string | null>(null);

	const sorted = useMemo(() => [...packs].sort((a, b) => a.name.localeCompare(b.name)), [packs]);

	const describe = (packId: string, enabled: boolean) => {
		const count = customWonders.filter((w) => w.packId === packId).length;
		const wonders = `${count} merveille${count > 1 ? "s" : ""}`;
		return enabled ? wonders : `${wonders} · désactivée`;
	};

	const submit = () => {
		const nameError = getWonderPackNameError(name, packs);
		if (nameError) {
			setError(nameError);
			return;
		}
		const pack = addPack(name);
		setName("");
		setError(null);
		if (pack) router.push(`/settings/wonder-packs/${pack.id}`);
	};

	return (
		<View style={styles.section}>
			<SectionTitle>Extensions non officielles</SectionTitle>
			<Text style={styles.note}>
				Regroupe tes merveilles non officielles (Wonders Box, tes créations…) pour les activer ou
				les désactiver d'un geste, et comparer leurs statistiques.
			</Text>
			{sorted.map((pack) => (
				<SettingsRow
					key={pack.id}
					icon="albums"
					label={pack.name}
					value={describe(pack.id, pack.enabled)}
					onPress={() => router.push(`/settings/wonder-packs/${pack.id}`)}
				/>
			))}
			<TextField
				placeholder="Nouvelle extension"
				value={name}
				onChangeText={(text) => {
					setName(text);
					setError(null);
				}}
				onSubmitEditing={submit}
				maxLength={MAX_WONDER_PACK_NAME_LENGTH}
			/>
			{error && <Text style={styles.error}>{error}</Text>}
			<Button label="Créer l'extension" variant="secondary" onPress={submit} />
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
				error: {
					color: colors.danger,
					fontSize: 13,
				},
			}),
		[colors],
	);
}
