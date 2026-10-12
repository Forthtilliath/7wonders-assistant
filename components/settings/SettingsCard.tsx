import { Ionicons } from "@expo/vector-icons";
import type { PropsWithChildren } from "react";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { ThemeColors } from "@/constants/theme";
import { RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

type IconName = keyof typeof Ionicons.glyphMap;

type Props = PropsWithChildren<{
	icon: IconName;
	title: string;
}>;

/** Carte de réglages : en-tête (icône + titre) puis contenu libre (lignes d'état, texte, boutons). */
export function SettingsCard({ icon, title, children }: Props) {
	const colors = useColors();
	const styles = useStyles(colors);

	return (
		<View style={styles.card}>
			<View style={styles.header}>
				<Ionicons name={icon} size={20} color={colors.primary} />
				<Text style={styles.title}>{title}</Text>
			</View>
			{children}
		</View>
	);
}

type StatusProps = {
	icon: IconName;
	color?: string;
	children: React.ReactNode;
};

/** Ligne d'état d'une carte : petite icône suivie d'un texte (compte relié, date de sauvegarde…). */
export function SettingsCardStatus({ icon, color, children }: StatusProps) {
	const colors = useColors();
	const styles = useStyles(colors);

	return (
		<View style={styles.statusRow}>
			<Ionicons name={icon} size={16} color={color ?? colors.textMuted} />
			<Text style={styles.status}>{children}</Text>
		</View>
	);
}

/** Texte explicatif d'une carte, en retrait par rapport aux lignes d'état. */
export function SettingsCardHint({ children }: { children: React.ReactNode }) {
	const colors = useColors();
	const styles = useStyles(colors);

	return <Text style={styles.hint}>{children}</Text>;
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				card: {
					backgroundColor: colors.surface,
					borderRadius: RADIUS.md,
					padding: SPACING.md,
					gap: SPACING.sm,
				},
				header: {
					flexDirection: "row",
					alignItems: "center",
					gap: SPACING.sm,
				},
				title: {
					color: colors.text,
					fontSize: 16,
					fontWeight: "700",
				},
				statusRow: {
					flexDirection: "row",
					alignItems: "center",
					gap: SPACING.sm,
				},
				status: {
					flex: 1,
					color: colors.text,
					fontSize: 14,
				},
				hint: {
					color: colors.textMuted,
					fontSize: 13,
					marginBottom: SPACING.xs,
				},
			}),
		[colors],
	);
}
