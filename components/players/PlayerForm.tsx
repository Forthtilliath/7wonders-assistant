import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AvatarSourceSheet } from "@/components/players/AvatarSourceSheet";
import { Button } from "@/components/ui/Button";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { TextField } from "@/components/ui/TextField";
import type { ThemeColors } from "@/constants/theme";
import { SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { type AvatarSource, pickAvatar } from "@/lib/pickAvatar";

type Props = {
	/** Id du joueur en cours de modification, pour que la couleur de son avatar reste la même
	 * qu'ailleurs dans l'app (dérivée de l'id, pas du nom). Absent pour un nouveau joueur : pas
	 * encore d'id, la couleur se base alors sur le nom tapé jusqu'à la création. */
	playerId?: string;
	initialName?: string;
	initialAvatarUri?: string;
	submitLabel: string;
	onSubmit: (values: { name: string; avatarUri?: string }) => void;
	extra?: React.ReactNode;
};

export function PlayerForm({
	playerId,
	initialName = "",
	initialAvatarUri,
	submitLabel,
	onSubmit,
	extra,
}: Props) {
	const colors = useColors();
	const styles = useStyles(colors);
	const [name, setName] = useState(initialName);
	const [avatarUri, setAvatarUri] = useState(initialAvatarUri);
	const [sourceSheetVisible, setSourceSheetVisible] = useState(false);

	const handlePick = async (source: AvatarSource) => {
		const uri = await pickAvatar(source);
		if (uri) setAvatarUri(uri);
	};

	const canSubmit = name.trim().length > 0;

	return (
		<View style={styles.container}>
			<Pressable
				style={styles.avatarPicker}
				onPress={() => setSourceSheetVisible(true)}
				accessibilityRole="button"
				accessibilityLabel="Changer la photo"
			>
				<PlayerAvatar name={name || "?"} avatarUri={avatarUri} seed={playerId} size={96} />
				<Text style={styles.avatarHint}>Changer la photo</Text>
			</Pressable>

			<AvatarSourceSheet
				visible={sourceSheetVisible}
				onClose={() => setSourceSheetVisible(false)}
				onPick={handlePick}
				onRemove={avatarUri ? () => setAvatarUri(undefined) : undefined}
			/>

			<TextField
				label="Nom du joueur"
				placeholder="Ex : Alex"
				value={name}
				onChangeText={setName}
				autoFocus
			/>

			{extra}

			<Button
				label={submitLabel}
				disabled={!canSubmit}
				onPress={() => onSubmit({ name: name.trim(), avatarUri })}
				style={styles.submit}
			/>
		</View>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				container: {
					gap: SPACING.lg,
				},
				avatarPicker: {
					alignItems: "center",
					gap: SPACING.sm,
				},
				avatarHint: {
					color: colors.primary,
					fontSize: 14,
				},
				submit: {
					marginTop: SPACING.md,
				},
			}),
		[colors],
	);
}
