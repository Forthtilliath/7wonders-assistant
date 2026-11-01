import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { PrereleaseToggle } from "@/components/settings/PrereleaseToggle";
import { UpdateChecker } from "@/components/settings/UpdateChecker";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { APP_INFO } from "@/constants/app";
import type { ThemeColors } from "@/constants/theme";
import { cardSurface, FONTS, RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

export default function AboutSettingsScreen() {
	const colors = useColors();
	const styles = useStyles(colors);
	return (
		<ScreenContainer>
			<ScrollView contentContainerStyle={styles.content}>
				<View style={styles.appHeader}>
					<Text style={styles.appName}>{APP_INFO.name}</Text>
					<Text style={styles.appVersion}>Version {APP_INFO.version}</Text>
					<UpdateChecker />
				</View>

				<PrereleaseToggle />

				<View style={styles.section}>
					<SectionTitle>Infos</SectionTitle>
					<Text style={styles.sectionText}>
						Toutes les données (joueurs, parties, statistiques) sont stockées sur cet appareil, sans
						compte à créer. Seule la sauvegarde Google Drive, si tu l'actives, en envoie une copie
						dans un dossier privé de ton Drive, invisible pour les autres applications.
					</Text>
				</View>
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
					paddingBottom: SPACING.lg,
				},
				appHeader: {
					alignItems: "center",
					gap: SPACING.xs,
				},
				appName: {
					color: colors.text,
					fontSize: 20,
					fontFamily: FONTS.displayBold,
				},
				appVersion: {
					color: colors.textMuted,
					fontSize: 13,
				},
				section: {
					...cardSurface(colors),
					borderRadius: RADIUS.md,
					padding: SPACING.md,
					gap: SPACING.sm,
				},
				sectionText: {
					color: colors.text,
					fontSize: 14,
					lineHeight: 20,
				},
			}),
		[colors],
	);
}
