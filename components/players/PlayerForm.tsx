import * as ImagePicker from "expo-image-picker";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { TextField } from "@/components/ui/TextField";
import type { ThemeColors } from "@/constants/theme";
import { SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

type Props = {
	initialName?: string;
	initialAvatarUri?: string;
	submitLabel: string;
	onSubmit: (values: { name: string; avatarUri?: string }) => void;
	extra?: React.ReactNode;
};

export function PlayerForm({
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

	const pickAvatar = async () => {
		const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (!permission.granted) return;

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.7,
		});
		if (!result.canceled && result.assets[0]) {
			setAvatarUri(result.assets[0].uri);
		}
	};

	const canSubmit = name.trim().length > 0;

	return (
		<View style={styles.container}>
			<Pressable
				style={styles.avatarPicker}
				onPress={pickAvatar}
				accessibilityRole="button"
				accessibilityLabel="Changer la photo"
			>
				<PlayerAvatar name={name || "?"} avatarUri={avatarUri} size={96} />
				<Text style={styles.avatarHint}>Changer la photo</Text>
			</Pressable>

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
