import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BottomSheet } from "@/components/ui/BottomSheet";
import type { ThemeColors } from "@/constants/theme";
import { RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import type { AvatarSource } from "@/lib/pickAvatar";

type Props = {
	visible: boolean;
	onClose: () => void;
	onPick: (source: AvatarSource) => void;
	/** Absent quand le joueur n'a pas encore de photo : rien à retirer. */
	onRemove?: () => void;
};

type Option = {
	icon: keyof typeof Ionicons.glyphMap;
	label: string;
	description: string;
	onPress: () => void;
	destructive?: boolean;
};

/** Choix de la photo d'un joueur : la prendre sur le moment, la choisir dans la galerie, ou la retirer. */
export function AvatarSourceSheet({ visible, onClose, onPick, onRemove }: Props) {
	const colors = useColors();
	const styles = useStyles(colors);

	const options: Option[] = [
		{
			icon: "camera-outline",
			label: "Prendre une photo",
			description: "Pratique pour distinguer deux joueurs du même nom",
			onPress: () => onPick("camera"),
		},
		{
			icon: "images-outline",
			label: "Choisir dans la galerie",
			description: "Une photo déjà enregistrée sur le téléphone",
			onPress: () => onPick("library"),
		},
	];
	if (onRemove) {
		options.push({
			icon: "trash-outline",
			label: "Retirer la photo",
			description: "Le joueur retrouve ses initiales",
			onPress: onRemove,
			destructive: true,
		});
	}

	const handlePress = (option: Option) => {
		onClose();
		option.onPress();
	};

	return (
		<BottomSheet visible={visible} onClose={onClose} title="Photo du joueur">
			{options.map((option) => {
				const color = option.destructive ? colors.danger : colors.primary;
				return (
					<Pressable
						key={option.label}
						style={({ pressed }) => [styles.option, pressed && styles.pressed]}
						onPress={() => handlePress(option)}
						accessibilityRole="button"
						accessibilityLabel={option.label}
					>
						<View style={styles.iconWrap}>
							<Ionicons name={option.icon} size={22} color={color} />
						</View>
						<View style={styles.texts}>
							<Text style={[styles.label, option.destructive && { color }]}>{option.label}</Text>
							<Text style={styles.description}>{option.description}</Text>
						</View>
					</Pressable>
				);
			})}
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
