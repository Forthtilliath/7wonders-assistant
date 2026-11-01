import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { BoxCover } from "@/constants/covers";
import type { ThemeColors } from "@/constants/theme";
import { FONTS, RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

type Props = {
	label: string;
	cover: BoxCover;
	/** Hauteur de la boîte, la largeur suit ses proportions. */
	height: number;
	/** Proportions de la boîte de remplacement quand aucun visuel n'est disponible. */
	fallbackAspectRatio: number;
	selected: boolean;
	/** "radio" pour un choix unique (édition), "checkbox" pour un choix multiple (extensions). */
	role: "radio" | "checkbox";
	/** Nom affiché sous la boîte, quand le visuel ne suffit pas à distinguer (1re / 2e édition). */
	caption?: string;
	onPress: () => void;
};

/** Boîte de jeu à cocher : sa couverture (ou son nom, sans visuel), estompée tant qu'elle n'est pas
 * choisie, cerclée et marquée d'une coche une fois choisie. */
export function BoxCoverOption({
	label,
	cover,
	height,
	fallbackAspectRatio,
	selected,
	role,
	caption,
	onPress,
}: Props) {
	const colors = useColors();
	const styles = useStyles(colors);
	const width = Math.round(height * (cover?.aspectRatio ?? fallbackAspectRatio));

	return (
		<Pressable
			onPress={onPress}
			style={[styles.option, !selected && styles.unselected]}
			accessibilityRole={role}
			accessibilityState={{ checked: selected }}
			accessibilityLabel={label}
		>
			<View style={[styles.frame, selected && styles.frameSelected]}>
				{cover ? (
					<Image source={cover.source} style={{ width, height }} contentFit="contain" />
				) : (
					<View style={[styles.placeholder, { width, height }]}>
						<Text style={styles.placeholderText}>{label}</Text>
					</View>
				)}
				{selected && (
					<View style={styles.badge}>
						<Ionicons name="checkmark" size={14} color={colors.primaryText} />
					</View>
				)}
			</View>
			{caption && (
				<Text style={[styles.caption, selected && styles.captionSelected]}>{caption}</Text>
			)}
		</Pressable>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				option: {
					alignItems: "center",
					gap: SPACING.xs,
				},
				unselected: {
					opacity: 0.4,
				},
				frame: {
					padding: SPACING.xs,
					borderRadius: RADIUS.md,
					borderWidth: 2,
					borderColor: "transparent",
				},
				frameSelected: {
					borderColor: colors.primary,
				},
				placeholder: {
					alignItems: "center",
					justifyContent: "center",
					padding: SPACING.xs,
					borderRadius: RADIUS.sm,
					borderWidth: 1,
					borderColor: colors.border,
					backgroundColor: colors.surfaceAlt,
				},
				placeholderText: {
					color: colors.text,
					fontFamily: FONTS.displayBold,
					fontSize: 13,
					textAlign: "center",
				},
				badge: {
					position: "absolute",
					top: -SPACING.xs,
					right: -SPACING.xs,
					width: 22,
					height: 22,
					borderRadius: 11,
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: colors.primary,
				},
				caption: {
					color: colors.textMuted,
					fontSize: 12,
				},
				captionSelected: {
					color: colors.text,
					fontWeight: "600",
				},
			}),
		[colors],
	);
}
