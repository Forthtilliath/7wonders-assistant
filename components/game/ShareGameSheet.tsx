import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { BottomSheet } from "@/components/ui/BottomSheet";
import type { ThemeColors } from "@/constants/theme";
import { RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import type { CaptureTarget } from "@/hooks/useGameCapture";
import { exportGameCsv } from "@/lib/backup";
import { shareGameText } from "@/lib/shareGame";
import { usePlayersStore } from "@/stores/playersStore";
import type { Game } from "@/types/game";

type Props = {
	visible: boolean;
	onClose: () => void;
	game: Game;
	/** Partage en image (voir `useGameCapture`). */
	shareImage: (target: CaptureTarget) => Promise<void>;
};

type Option = {
	icon: keyof typeof Ionicons.glyphMap;
	label: string;
	description: string;
	share: () => Promise<void>;
};

/** Choix du format de partage d'une partie : texte, image (avec ou sans graphiques) ou CSV. */
export function ShareGameSheet({ visible, onClose, game, shareImage }: Props) {
	const colors = useColors();
	const styles = useStyles(colors);

	const options: Option[] = [
		{
			icon: "chatbubble-ellipses-outline",
			label: "Texte",
			description: "Le classement en quelques lignes, pour une messagerie",
			share: () => shareGameText(game, usePlayersStore.getState().players),
		},
		{
			icon: "image-outline",
			label: "Image",
			description: "Une capture du classement avec le détail des points",
			share: () => shareImage("ranking"),
		},
		{
			icon: "pie-chart-outline",
			label: "Image avec graphiques",
			description: "Le classement suivi de la répartition des points et des comparaisons",
			share: () => shareImage("charts"),
		},
		{
			icon: "grid-outline",
			label: "Tableur (CSV)",
			description: "Tous les scores par catégorie, à ouvrir dans un tableur",
			share: () => exportGameCsv(game),
		},
	];

	const handlePress = async (option: Option) => {
		onClose();
		try {
			await option.share();
		} catch {
			Alert.alert("Erreur", "Le partage a échoué.");
		}
	};

	return (
		<BottomSheet visible={visible} onClose={onClose} title="Partager la partie">
			{options.map((option) => (
				<Pressable
					key={option.label}
					style={({ pressed }) => [styles.option, pressed && styles.pressed]}
					onPress={() => handlePress(option)}
					accessibilityRole="button"
					accessibilityLabel={`Partager en ${option.label}`}
				>
					<View style={styles.iconWrap}>
						<Ionicons name={option.icon} size={22} color={colors.primary} />
					</View>
					<View style={styles.texts}>
						<Text style={styles.label}>{option.label}</Text>
						<Text style={styles.description}>{option.description}</Text>
					</View>
				</Pressable>
			))}
		</BottomSheet>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				option: {
					flexDirection: "row",
					alignItems: "center",
					gap: SPACING.md,
					paddingVertical: SPACING.sm,
					borderRadius: RADIUS.md,
				},
				pressed: {
					opacity: 0.6,
				},
				iconWrap: {
					width: 40,
					height: 40,
					borderRadius: RADIUS.full,
					backgroundColor: colors.surfaceAlt,
					alignItems: "center",
					justifyContent: "center",
				},
				texts: {
					flex: 1,
				},
				label: {
					color: colors.text,
					fontSize: 16,
					fontWeight: "600",
				},
				description: {
					color: colors.textMuted,
					fontSize: 13,
				},
			}),
		[colors],
	);
}
