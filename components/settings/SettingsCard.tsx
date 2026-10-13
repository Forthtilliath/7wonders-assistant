import type { Ionicons } from "@expo/vector-icons";
import {
	SettingsCard as KitSettingsCard,
	SettingsCardHint as KitSettingsCardHint,
	SettingsCardStatus as KitSettingsCardStatus,
} from "@forthtilliath/react-native-kit/components/settings/SettingsCard";
import type { PropsWithChildren, ReactNode } from "react";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import type { ThemeColors } from "@/constants/theme";
import { RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

type IconName = keyof typeof Ionicons.glyphMap;

type Props = PropsWithChildren<{
	icon: IconName;
	title: string;
}>;

/** Carte de réglages (`SettingsCard` de react-native-kit) aux couleurs de l'app. */
export function SettingsCard({ icon, title, children }: Props) {
	const colors = useColors();
	const styles = useStyles(colors);

	return (
		<KitSettingsCard
			icon={icon}
			title={title}
			iconColor={colors.primary}
			styles={{ card: styles.card, header: styles.header, title: styles.title }}
		>
			{children}
		</KitSettingsCard>
	);
}

type StatusProps = {
	icon: IconName;
	color?: string;
	children: ReactNode;
};

/** Ligne d'état d'une carte : petite icône suivie d'un texte (compte relié, date de sauvegarde…). */
export function SettingsCardStatus({ icon, color, children }: StatusProps) {
	const colors = useColors();
	const styles = useStyles(colors);

	return (
		<KitSettingsCardStatus
			icon={icon}
			iconColor={color ?? colors.textMuted}
			styles={{ row: styles.statusRow, text: styles.status }}
		>
			{children}
		</KitSettingsCardStatus>
	);
}

/** Texte explicatif d'une carte, en retrait par rapport aux lignes d'état. */
export function SettingsCardHint({ children }: { children: ReactNode }) {
	const colors = useColors();
	const styles = useStyles(colors);

	return <KitSettingsCardHint style={styles.hint}>{children}</KitSettingsCardHint>;
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				card: {
					backgroundColor: colors.surface,
					borderRadius: RADIUS.md,
					borderWidth: 0,
					padding: SPACING.md,
					gap: SPACING.sm,
				},
				header: {
					gap: SPACING.sm,
				},
				title: {
					color: colors.text,
					fontSize: 16,
					fontWeight: "700",
				},
				statusRow: {
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
